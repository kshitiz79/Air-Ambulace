import React from 'react';
import { useThemeStyles } from '../../hooks/useThemeStyles';

const ThemeTable = ({ headers, data, renderRow, emptyMessage = "No data available" }) => {
  const styles = useThemeStyles();

  return (
    <div className="overflow-x-auto">
      {data.length === 0 ? (
        <div className={`p-8 text-center ${styles.mutedText}`}>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <table className="min-w-full">
          <thead className={styles.tableHeader}>
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${styles.tableHeaderText}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${styles.tableBorder}`}>
            {data.map((item, index) => (
              <tr key={index} className={styles.tableRow}>
                {renderRow(item, index)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ThemeTable;