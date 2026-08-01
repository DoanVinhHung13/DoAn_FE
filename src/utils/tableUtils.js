/**
 * Table utility functions
 * 
 * Helper functions for common table operations
 */

import { PAGE_SIZE } from 'src/constants/pageSizeOptions'

/**
 * Create pagination configuration for Ant Design Table
 * 
 * @param {number} page - Current page number
 * @param {number} pageSize - Current page size
 * @param {number} totalRecords - Total number of records
 * @param {Function} onChange - Callback when page or pageSize changes
 * @returns {Object} Ant Design Table pagination config
 * 
 * @example
 * <CustomTable
 *   dataSource={listData}
 *   columns={columns}
 *   pagination={createPaginationConfig(page, pageSize, totalRecords, (p, ps) => {
 *     setPage(p)
 *     setPageSize(ps)
 *   })}
 * />
 */
export const createPaginationConfig = (page, pageSize, totalRecords, onChange) => ({
  current: page,
  pageSize,
  total: totalRecords,
  showSizeChanger: true,
  pageSizeOptions: PAGE_SIZE,
  onChange,
  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
})
