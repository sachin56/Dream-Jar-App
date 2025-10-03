import { router } from 'expo-router'; // 👈 Import router
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

// ... (chartData and screenWidth remain the same)
const chartData = {
  labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  datasets: [
    {
      data: [300, 450, 280, 800, 990, 430],
    },
  ],
};
const screenWidth = Dimensions.get('window').width;


const SavingsBarChart = () => {
  // ... (chartConfig remains the same)
  const chartConfig = {
    backgroundColor: '#1F2937',
    backgroundGradientFrom: '#1F2937',
    backgroundGradientTo: '#1F2937',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const handlePress = () => {
    // Navigate to a new screen when the chart is pressed
    router.push('/chart-details');
  };

  return (
    // Wrap the chart in a TouchableOpacity
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <BarChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        yAxisLabel="$"
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        fromZero={true}
        style={styles.chart}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 16,
    // Add shadow/elevation for a "pressable" look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  chart: {
    borderRadius: 16,
  },
});

export default SavingsBarChart;