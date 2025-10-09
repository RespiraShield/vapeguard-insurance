import React from 'react';
import { Card, Typography } from 'antd';
import { Column } from '@ant-design/charts';
import { DollarCircleOutlined } from '@ant-design/icons';
import { MonthlyPayment } from '../../../types';
import { MESSAGES } from './constants';
import './PaymentChart.css';

const { Title, Text } = Typography;

interface PaymentChartProps {
  payments: MonthlyPayment[];
  loading?: boolean;
}

const PaymentChart: React.FC<PaymentChartProps> = ({ payments, loading = false }) => {
  const chartData = payments.map(payment => ({
    month: payment.month,
    amount: payment.amount,
    count: payment.count,
  }));

  const config = {
    data: chartData,
    xField: 'month',
    yField: 'amount',
    columnWidthRatio: 0.6,
    color: '#667eea',
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    tooltip: {
      formatter: (datum: any) => {
        const amount = Number(datum?.amount) || 0;
        const count = Number(datum?.count) || 0;
        return {
          name: 'Amount Paid',
          value: amount > 0 ? `₹${amount.toLocaleString()} (${count} payment${count !== 1 ? 's' : ''})` : 'No payments this month',
        };
      },
    },
    label: {
      position: 'top' as const,
      formatter: (datum: any) => {
        const amount = datum?.amount || 0;
        return amount > 0 ? `₹${amount.toLocaleString()}` : '';
      },
      style: {
        fontSize: 12,
        fill: '#6b7280',
      },
    },
    xAxis: {
      label: {
        style: {
          fontSize: 12,
          fill: '#6b7280',
        },
      },
    },
    yAxis: {
      label: {
        formatter: (value: string) => `₹${parseInt(value).toLocaleString()}`,
        style: {
          fontSize: 12,
          fill: '#6b7280',
        },
      },
    },
    meta: {
      amount: {
        alias: 'Payment Amount (₹)',
      },
      month: {
        alias: 'Month',
      },
    },
  };

  const currentYear = new Date().getFullYear();

  return (
    <Card className="payment-chart-card" loading={loading}>
      <div className="chart-header">
        <Title level={4} className="chart-title">
          Monthly Payments ({currentYear})
        </Title>
      </div>
      
      {chartData.length > 0 && chartData.some(d => d.amount > 0) ? (
        <div className="chart-container">
          <Column {...config} />
        </div>
      ) : (
        <div className="no-data">
          <DollarCircleOutlined className="no-data-icon" />
          <Text className="no-data-title">{MESSAGES.NO_DATA_TITLE}</Text>
          <Text className="no-data-message">{MESSAGES.NO_DATA_MESSAGE}</Text>
        </div>
      )}
    </Card>
  );
};

export default PaymentChart;
