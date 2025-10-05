const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Import old and new models
const OldApplication = require('../models/Application');
const User = require('../models/User');
const Application = require('../models/Application');
const InsurancePlan = require('../models/InsurancePlan');
const Verification = require('../models/Verification');
const Payment = require('../models/Payment');
const BillPhoto = require('../models/BillPhoto');

class DatabaseMigration {
  constructor() {
    this.stats = {
      processed: 0,
      migrated: 0,
      errors: 0,
      skipped: 0
    };
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vape-insurance', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  async seedInsurancePlans() {
    console.log('🌱 Checking existing insurance plans...');
    try {
      const existingPlans = await InsurancePlan.find({});
      console.log(`✅ Found ${existingPlans.length} existing insurance plans - skipping seeding`);
    } catch (error) {
      console.error('❌ Error checking insurance plans:', error);
    }
  }

  async migrateApplications() {
    console.log('🔄 Starting application migration...');
    
    try {
      const oldApplications = await OldApplication.find({});
      console.log(`📊 Found ${oldApplications.length} applications to migrate`);

      for (const oldApp of oldApplications) {
        this.stats.processed++;
        
        try {
          await this.migrateApplication(oldApp);
          this.stats.migrated++;
          
          if (this.stats.processed % 10 === 0) {
            console.log(`📈 Progress: ${this.stats.processed}/${oldApplications.length} processed`);
          }
        } catch (error) {
          this.stats.errors++;
          console.error(`❌ Error migrating application ${oldApp._id}:`, error.message);
        }
      }

      console.log('✅ Migration completed!');
      console.log('📊 Migration Statistics:');
      console.log(`   - Processed: ${this.stats.processed}`);
      console.log(`   - Migrated: ${this.stats.migrated}`);
      console.log(`   - Errors: ${this.stats.errors}`);
      console.log(`   - Skipped: ${this.stats.skipped}`);

    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  }

  async migrateApplication(oldApp) {
    // Skip if already migrated (check by applicationNumber)
    if (oldApp.applicationNumber) {
      const existingApp = await Application.findOne({ 
        applicationNumber: oldApp.applicationNumber 
      });
      if (existingApp) {
        this.stats.skipped++;
        return;
      }
    }

    // 1. Create or find User
    let user = null;
    if (oldApp.personalDetails && oldApp.personalDetails.email) {
      user = await User.findOne({ 
        email: oldApp.personalDetails.email 
      });

      if (!user) {
        user = new User({
          name: oldApp.personalDetails.name,
          email: oldApp.personalDetails.email,
          phone: oldApp.personalDetails.phone,
          dateOfBirth: oldApp.personalDetails.dateOfBirth,
          city: oldApp.personalDetails.city,
          age: oldApp.personalDetails.age,
          metadata: oldApp.metadata || {}
        });
        await user.save();
      }
    } else {
      // Skip applications without personal details
      this.stats.skipped++;
      return;
    }

    // 2. Find Insurance Plan
    let insurancePlan = null;
    if (oldApp.insuranceDetails && oldApp.insuranceDetails.selectedPlan) {
      insurancePlan = await InsurancePlan.findOne({ 
        planId: oldApp.insuranceDetails.selectedPlan 
      });
    }

    // 3. Create new Application
    const newApp = new Application({
      userId: user._id,
      insurancePlanId: insurancePlan ? insurancePlan._id : undefined,
      applicationNumber: oldApp.applicationNumber,
      status: oldApp.status || 'draft',
      submittedAt: oldApp.submittedAt,
      completedAt: oldApp.completedAt,
      emailSent: oldApp.emailSent || false,
      metadata: oldApp.metadata || {},
      createdAt: oldApp.createdAt,
      updatedAt: oldApp.updatedAt
    });
    await newApp.save();

    // 4. Create Verification record
    if (oldApp.verification) {
      const verification = new Verification({
        userId: user._id,
        applicationId: newApp._id,
        email: {
          verified: oldApp.verification.email?.verified || false,
          attempts: oldApp.verification.email?.attempts || 0,
          verifiedAt: oldApp.verification.email?.verified ? oldApp.updatedAt : undefined
        },
        phone: {
          verified: oldApp.verification.phone?.verified || false,
          attempts: oldApp.verification.phone?.attempts || 0,
          verifiedAt: oldApp.verification.phone?.verified ? oldApp.updatedAt : undefined
        },
        isComplete: (oldApp.verification.email?.verified && oldApp.verification.phone?.verified) || false,
        completedAt: (oldApp.verification.email?.verified && oldApp.verification.phone?.verified) ? oldApp.updatedAt : undefined
      });
      await verification.save();
    }

    // 5. Create Payment record
    if ((oldApp.transactionDetails || oldApp.paymentDetails) && insurancePlan) {
      const paymentMethod = oldApp.paymentDetails?.method || 'upi';
      const payment = new Payment({
        userId: user._id,
        applicationId: newApp._id,
        insurancePlanId: insurancePlan._id,
        amount: oldApp.transactionDetails?.amount || insurancePlan.price.amount,
        currency: oldApp.transactionDetails?.currency || 'INR',
        paymentMethod: paymentMethod,
        upiId: paymentMethod === 'upi' ? (oldApp.paymentDetails?.upiId || 'migrated@upi') : undefined,
        transactionId: oldApp.transactionDetails?.transactionId,
        razorpayOrderId: oldApp.transactionDetails?.razorpayOrderId,
        razorpayPaymentId: oldApp.transactionDetails?.razorpayPaymentId,
        status: this.mapPaymentStatus(oldApp.paymentStatus),
        completedAt: oldApp.transactionDetails?.paidAt,
        createdAt: oldApp.createdAt
      });
      await payment.save();
    }

    // 6. Create BillPhoto record
    if (oldApp.billPhoto && oldApp.billPhoto.filename) {
      const billPhoto = new BillPhoto({
        userId: user._id,
        applicationId: newApp._id,
        filename: oldApp.billPhoto.filename,
        originalName: oldApp.billPhoto.originalName,
        mimetype: oldApp.billPhoto.mimetype,
        size: oldApp.billPhoto.size,
        path: oldApp.billPhoto.path,
        status: 'uploaded',
        createdAt: oldApp.billPhoto.uploadedAt || oldApp.createdAt
      });
      await billPhoto.save();
    }
  }

  mapPaymentStatus(oldStatus) {
    const statusMap = {
      'pending': 'pending',
      'processing': 'processing',
      'completed': 'completed',
      'failed': 'failed',
      'refunded': 'refunded'
    };
    return statusMap[oldStatus] || 'pending';
  }

  async createBackup() {
    console.log('💾 Creating backup of existing data...');
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const appCollection = collections.find(col => col.name === 'applications');
      
      if (appCollection) {
        await mongoose.connection.db.collection('applications').rename('applications_backup_' + Date.now());
        console.log('✅ Backup created successfully');
      }
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      throw error;
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Main migration function
async function runMigration() {
  const migration = new DatabaseMigration();
  
  try {
    await migration.connect();
    
    // Seed insurance plans first
    await migration.seedInsurancePlans();
    
    // Create backup (optional - uncomment if needed)
    // await migration.createBackup();
    
    // Run migration
    await migration.migrateApplications();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await migration.cleanup();
  }
}

// Run migration if called directly
if (require.main === module) {
  console.log('🚀 Starting database migration...');
  runMigration();
}

module.exports = { DatabaseMigration, runMigration };
