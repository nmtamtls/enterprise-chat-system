// import React, { useState } from 'react';
// import styles from '../../styles/CreateGroupModal.module.css'; // Tạo file css tương ứng

// const CreateGroupModal = ({ friends, currentUser, onClose, onSuccess }) => {
//     const [groupName, setGroupName] = useState('');
//     const [selectedIds, setSelectedIds] = useState([]);

//     const toggleSelect = (id) => {
//         setSelectedIds(prev => 
//             prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
//         );
//     };

//     const handleCreate = async () => {
//         if (!groupName) return alert("Vui lòng nhập tên nhóm");
//         if (selectedIds.length < 2) return alert("Nhóm cần ít nhất 3 người (bao gồm bạn)");
        
//         onSuccess(groupName, selectedIds);
//     };

//     return (
//         <div className={styles.overlay}>
//             <div className={styles.modal}>
//                 <h3>Tạo nhóm mới</h3>
//                 <input 
//                     type="text" 
//                     placeholder="Tên nhóm..." 
//                     value={groupName}
//                     onChange={(e) => setGroupName(e.target.value)}
//                 />
//                 <div className={styles.list}>
//                     {friends.map(user => (
//                         <div key={user.id} className={styles.item}>
//                             <input 
//                                 type="checkbox" 
//                                 onChange={() => toggleSelect(user.id)} 
//                             />
//                             <span>{user.fullName}</span>
//                         </div>
//                     ))}
//                 </div>
//                 <div className={styles.actions}>
//                     <button onClick={onClose}>Hủy</button>
//                     <button onClick={handleCreate} className={styles.btnPrimary}>Tạo nhóm</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreateGroupModal;