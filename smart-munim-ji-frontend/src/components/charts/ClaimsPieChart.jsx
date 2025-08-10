// src/components/charts/ClaimsPieChart.jsx

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styled, { useTheme } from "styled-components"; // Import styled and useTheme

/**
 * A container for the chart that applies consistent styling like padding and shadow.
 */
const ChartWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const ChartTitle = styled.h3`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) =>
    theme.colors.text}; /* Use text color for chart titles */
`;

const NoDataMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.xl};
`;

/**
 * A specialized pie chart for displaying claim status distribution.
 * It uses theme colors for consistency and provides custom labels for percentages.
 * @param {object} props - Component props.
 * @param {Array<object>} props.data - The dataset, e.g., [{ name: 'REQUESTED', value: 5 }]
 */
const ClaimsPieChart = ({ data }) => {
  const theme = useTheme(); // Access the theme object

  // Map claim statuses to our theme colors for visual consistency
  const STATUS_COLORS = {
    REQUESTED: theme.colors.primaryLight,
    ACCEPTED: theme.colors.success, // Using theme's success green
    IN_PROGRESS: "#007bff", // Keeping a standard blue for in-progress
    RESOLVED: "#28a745", // Slightly different green for resolved if desired, or use success
    DENIED: theme.colors.error, // Using theme's error red
    // Fallback for any other status not explicitly defined
    DEFAULT: theme.colors.textSecondary,
  };

  // Custom label renderer to show percentages on the slices
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.05) return null; // Don't render labels for tiny slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={theme.fontSizes.small} // Adjusted for better fit on slices
        fontWeight={theme.fontWeights.bold}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Check if data is valid and has items to display
  const hasData =
    data && data.length > 0 && data.some((entry) => entry.value > 0);

  return (
    <ChartWrapper>
      <ChartTitle>Claims Status Distribution</ChartTitle>
      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.md,
                boxShadow: theme.shadows.card,
                padding: theme.spacing.sm,
              }}
              labelStyle={{ color: theme.colors.primary }}
              itemStyle={{ color: theme.colors.text }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: theme.spacing.md,
                fontSize: theme.fontSizes.small,
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={100}
              dataKey="value"
              nameKey="name" // This tells Recharts to use 'name' for the legend labels
            >
              {/* Map over the data to assign a specific color to each pie slice */}
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.name] || STATUS_COLORS.DEFAULT}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <NoDataMessage>No claim data to display at this time.</NoDataMessage>
      )}
    </ChartWrapper>
  );
};

export default ClaimsPieChart;
