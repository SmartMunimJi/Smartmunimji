// src/components/charts/SimpleBarChart.jsx

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styled, { useTheme } from "styled-components";

// --- Styled Components ---
// Although Recharts components handle most of their internal styling,
// we can wrap them in a styled container for consistent padding/margins
// if this component were ever used directly without a parent 'card' div.
// For now, it mainly leverages theme via useTheme().

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px; /* Define a default height for the chart */
  /* Ensure charts have some margin if not inside a parent card */
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  /* Optional: Add a subtle border or background if not using a parent 'card' */
  /* background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => theme.spacing.md}; */
`;

/**
 * A reusable, responsive bar chart component.
 * It integrates with the styled-components theme for consistent styling.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.data - The dataset to display. E.g., [{ name: 'Jan', value: 400 }]
 *   Each object must contain keys specified by `xAxisKey` and `dataKey`.
 * @param {string} props.xAxisKey - The key in the data objects for the X-axis labels (e.g., 'name').
 * @param {string} props.dataKey - The key in the data objects for the bar's numerical value (e.g., 'value' or 'count').
 * @param {string} [props.barColor] - The hex color for the bars. Defaults to the theme's primary color.
 * @param {string} [props.title] - Optional title for the chart (for Accessibility or display within the chart itself).
 */
const SimpleBarChart = ({ data, xAxisKey, dataKey, barColor, title }) => {
  const theme = useTheme();

  // Determine the fill color for the bars
  const finalBarColor = barColor || theme.colors.primary;

  // --- Input Validation / Edge Case Handling ---
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <ChartWrapper>
        <p
          style={{
            textAlign: "center",
            color: theme.colors.textSecondary,
            paddingTop: theme.spacing.xl,
          }}
        >
          No data available to display this chart.
        </p>
      </ChartWrapper>
    );
  }

  // Ensure data objects have the required keys
  const hasRequiredKeys = data.every(
    (item) =>
      Object.prototype.hasOwnProperty.call(item, xAxisKey) &&
      Object.prototype.hasOwnProperty.call(item, dataKey)
  );

  if (!hasRequiredKeys) {
    return (
      <ChartWrapper>
        <p
          style={{
            textAlign: "center",
            color: theme.colors.error,
            paddingTop: theme.spacing.xl,
          }}
        >
          Error: Chart data is missing required keys ({xAxisKey}, {dataKey}).
        </p>
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper>
      {title && (
        <h4 style={{ textAlign: "center", marginBottom: theme.spacing.md }}>
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: theme.spacing.md,
            right: theme.spacing.lg,
            left: theme.spacing.sm,
            bottom: theme.spacing.sm,
          }}
        >
          {/* Grid lines with theme color */}
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />

          {/* X-Axis styling with theme color and font */}
          <XAxis
            dataKey={xAxisKey}
            stroke={theme.colors.textSecondary}
            tick={{
              fill: theme.colors.textSecondary,
              fontSize: theme.fontSizes.small,
            }}
            label={{
              value: xAxisKey,
              position: "insideBottom",
              offset: 0,
              fill: theme.colors.textSecondary,
            }}
          />

          {/* Y-Axis styling with theme color and font */}
          <YAxis
            stroke={theme.colors.textSecondary}
            tick={{
              fill: theme.colors.textSecondary,
              fontSize: theme.fontSizes.small,
            }}
            label={{
              value: dataKey,
              angle: -90,
              position: "insideLeft",
              fill: theme.colors.textSecondary,
            }}
          />

          {/* Tooltip styling with theme colors */}
          <Tooltip
            contentStyle={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.sm,
              boxShadow: theme.shadows.card,
              fontSize: theme.fontSizes.small,
              padding: theme.spacing.sm,
            }}
            labelStyle={{
              color: theme.colors.primary,
              fontWeight: theme.fontWeights.bold,
            }}
            itemStyle={{ color: theme.colors.text }}
          />

          {/* Legend styling with theme colors */}
          <Legend
            wrapperStyle={{
              fontSize: theme.fontSizes.small,
              color: theme.colors.textSecondary,
              paddingTop: theme.spacing.sm,
            }}
          />

          {/* Bar styling with dynamic fill color and rounded tops */}
          <Bar
            dataKey={dataKey}
            fill={finalBarColor}
            radius={[theme.radii.sm, theme.radii.sm, 0, 0]} // Rounded top corners
            name={dataKey.replace(/([A-Z])/g, " $1").trim()} // Make legend name more readable (e.g., 'totalProducts' -> 'Total Products')
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default SimpleBarChart;
