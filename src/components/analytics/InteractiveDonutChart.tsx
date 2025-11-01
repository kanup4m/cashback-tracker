import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface ChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface InteractiveDonutChartProps {
  data: ChartData[];
  title?: string;
  centerLabel?: string;
  centerValue?: string;
}

const InteractiveDonutChart: React.FC<InteractiveDonutChartProps> = ({
  data,
  title,
  centerLabel,
  centerValue,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredItem, setHoveredItem] = useState<ChartData | null>(null);

  return (
    <div className="relative">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="transition-all duration-300 cursor-pointer hover:opacity-80"
                  onMouseEnter={() => {
                    setActiveIndex(index);
                    setHoveredItem(entry);
                  }}
                  onMouseLeave={() => {
                    setActiveIndex(null);
                    setHoveredItem(null);
                  }}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <AnimatePresence mode="wait">
              {hoveredItem ? (
                <motion.div
                  key="hovered"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {hoveredItem.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ₹{hoveredItem.value.toFixed(2)}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {centerLabel || 'Total'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {centerValue || `₹${data.reduce((sum, item) => sum + item.value, 0).toFixed(2)}`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Legend with percentage bars */}
      <div className="mt-6 space-y-2">
        {data.map((item, index) => {
          const total = data.reduce((sum, d) => sum + d.value, 0);
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          
          return (
            <motion.div
              key={index}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                activeIndex === index 
                  ? 'bg-purple-50 dark:bg-purple-900/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onMouseEnter={() => {
                setActiveIndex(index);
                setHoveredItem(item);
              }}
              onMouseLeave={() => {
                setActiveIndex(null);
                setHoveredItem(null);
              }}
              whileHover={{ x: 5 }}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-2">
                ₹{item.value.toFixed(0)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveDonutChart;