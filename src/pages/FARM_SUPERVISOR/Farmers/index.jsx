/**
 * Farmers Management — Land Manager
 * Route: /land-manager/farmers
 * 
 * Re-uses the exact same component as /farm-manager/users.
 * The logic for showing/hiding CUD buttons is handled inside UsersManagement based on the Redux user role.
 * 
 * Land Manager chỉ có quyền xem (Read-only) nên các nút CUD sẽ bị ẩn.
 * API Backend cũng tự filter danh sách trả về chỉ chứa FARMER.
 */
import UsersManagement from 'src/pages/FARM_MANAGER/Users';

export default UsersManagement;
