import React from "react";
import { Chart as ChartJS, defaults } from "chart.js/auto";
import { Pie } from "react-chartjs-2";

const PieChart = ({ title, entries }) => {
  const labels = Object.keys(entries);
  const data = Object.values(entries);
  return (
    <Pie
      data={{
        labels: labels,
        datasets: [
          {
            label: title,
            data: data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      }}
    />
  );
};

export default PieChart;
