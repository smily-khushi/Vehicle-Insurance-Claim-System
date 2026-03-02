import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrashAlt, FaShieldAlt, FaUser, FaCar, FaMotorcycle, FaTimes, FaCheckCircle } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';

// Dummy insurance overlay data (indexed, shown alongside real users)
const dummyInsurance = [
    { type: 'Comprehensive', vehicle: 'Tesla Model 3', vehicleType: 'Car', policy: 'SD-INS-88271', premium: '₹12,500/yr', status: 'Active', expiry: '2027-03-15' },
    { type: 'Third Party', vehicle: 'Royal Enfield Classic 350', vehicleType: 'Bike', policy: 'SD-INS-44391', premium: '₹4,200/yr', status: 'Active', expiry: '2026-11-20' },
    { type: 'Comprehensive', vehicle: 'BMW X5', vehicleType: 'Car', policy: 'SD-INS-90012', premium: '₹28,000/yr', status: 'Expired', expiry: '2025-08-01' },
    { type: 'Zero Dep', vehicle: 'Honda City', vehicleType: 'Car', policy: 'SD-INS-66123', premium: '₹9,800/yr', status: 'Active', expiry: '2027-01-10' },
    { type: 'Third Party', vehicle: 'KTM Duke 390', vehicleType: 'Bike', policy: 'SD-INS-77541', premium: '₹3,100/yr', status: 'Pending', expiry: '2026-06-30' },
];

const AdminUsers = ({ onLogout }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    const [editRole, setEditRole] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/auth/users');
                const data = await res.json();
                if (res.ok) setUsers(data);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filtered = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const openEdit = (user) => {
        setSelectedUser(user);
        setEditName(user.fullName);
        setEditEmail(user.email);
        setEditRole(user.role || 'user');
        setShowEdit(true);
    };

    const openDelete = (user) => {
        setSelectedUser(user);
        setShowDelete(true);
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`http://localhost:5000/api/auth/users/${selectedUser._id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: editName,
                    email: editEmail,
                    role: editRole
                })
            });

            if (res.ok) {
                setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, fullName: editName, email: editEmail, role: editRole } : u));
                setShowEdit(false);
            } else {
                const data = await res.json();
                alert(data.message || 'Update failed');
            }
        } catch (err) {
            console.error('Update failed:', err);
            alert('Server error');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/auth/users/${selectedUser._id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
                setShowDelete(false);
            } else {
                alert('Delete failed');
            }
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Server error');
        }
    };

    const statusBadge = (status) => {
        const map = { Active: 'success', Expired: 'danger', Pending: 'warning' };
        return <Badge bg={`${map[status]}-subtle`} className={`text-${map[status]} rounded-pill px-3`}>{status}</Badge>;
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0e16' }}>
            <div style={{ width: 240, minWidth: 240, padding: 16 }} className="d-none d-lg-block">
                <AdminSidebar onLogout={onLogout} />
            </div>
            <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', color: '#e2e8f0' }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: '#e2e8f0' }}>User Management</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)' }} className="mb-0">View and manage all registered users & their insurance</p>
                    </div>
                    <Badge bg="primary-subtle" className="text-primary px-3 py-2 rounded-pill fs-6">
                        {users.length} Users
                    </Badge>
                </div>

                {/* Search */}
                <Card style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.07)' }} className="shadow-sm rounded-4 overflow-hidden mb-4">
                    <Card.Body className="py-3">
                        <InputGroup style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', padding: '0 16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <InputGroup.Text className="bg-transparent border-0 text-muted"><FaSearch /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search by name or email..."
                                className="bg-transparent border-0 shadow-none py-2 text-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </InputGroup>
                    </Card.Body>
                </Card>

                {/* Users Table */}
                <Card style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.07)' }} className="shadow-sm rounded-4 overflow-hidden mb-4">
                    <Card.Header className="py-3 border-0" style={{ background: 'transparent' }}>
                        <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ color: '#f8fafc' }}>
                            <FaUser className="text-primary me-2" /> Registered Users
                        </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="text-muted mt-2 small">Loading users...</p>
                            </div>
                        ) : (
                            <Table responsive hover variant="dark" className="mb-0 text-white bg-transparent">
                                <thead style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                    <tr>
                                        <th className="px-4 py-3 border-0" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>#</th>
                                        <th className="py-3 border-0" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Name</th>
                                        <th className="py-3 border-0" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</th>
                                        <th className="py-3 border-0" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Role</th>
                                        <th className="py-3 border-0" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Joined</th>
                                        <th className="px-4 py-3 border-0 text-end" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((user, idx) => {
                                        return (
                                            <tr key={user._id} className="align-middle bg-transparent" style={{ borderColor: 'rgba(255, 255, 255, 0.04)', background: 'transparent' }}>
                                                <td className="px-4 py-3 bg-transparent" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 'small' }}>{idx + 1}</td>
                                                <td className="py-3 bg-transparent" style={{ color: '#f8fafc' }}>{user.fullName}</td>
                                                <td className="py-3 bg-transparent" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 'small' }}>{user.email}</td>
                                                <td className="py-3 bg-transparent">
                                                    <Badge bg={user.role === 'admin' ? 'danger-subtle' : (user.role === 'officer' ? 'warning-subtle' : 'info-subtle')}
                                                        className={`text-${user.role === 'admin' ? 'danger' : (user.role === 'officer' ? 'warning' : 'info')} rounded-pill px-3`}>
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 bg-transparent" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 'small' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-end bg-transparent">
                                                    <Button variant="outline-light" size="sm" className="rounded-pill px-3 me-2 border-secondary-subtle" onClick={() => openEdit(user)}>
                                                        <FaEdit className="me-1 text-primary" /> Edit
                                                    </Button>
                                                    <Button variant="outline-light" size="sm" className="rounded-pill px-3 border-secondary-subtle" onClick={() => openDelete(user)}>
                                                        <FaTrashAlt className="me-1 text-danger" /> Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>

                {/* Insurance Details Cards */}
                <h5 className="fw-bold mb-3 d-flex align-items-center">
                    <FaShieldAlt className="text-primary me-2" /> Insurance Overview
                </h5>
                <Row className="g-4">
                    {filtered.map((user, idx) => {
                        const ins = dummyInsurance[idx % dummyInsurance.length];
                        return (
                            <Col md={6} xl={4} key={user._id}>
                                <Card style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.07)' }} className="shadow-sm rounded-4 h-100 overflow-hidden">
                                    <Card.Header className="py-3 text-white d-flex justify-content-between align-items-center" style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                                        <div className="d-flex align-items-center">
                                            <span className="me-2 fs-5" style={{ color: '#c7d2fe' }}>
                                                {ins.vehicleType === 'Car' ? <FaCar /> : <FaMotorcycle />}
                                            </span>
                                            <span className="fw-bold small" style={{ color: '#f8fafc' }}>{user.fullName}</span>
                                        </div>
                                        {statusBadge(ins.status)}
                                    </Card.Header>
                                    <Card.Body className="p-4">
                                        <div className="mb-2">
                                            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 'x-small', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Vehicle</p>
                                            <p className="fw-bold mb-0" style={{ color: '#f8fafc', fontSize: 'small' }}>{ins.vehicle}</p>
                                        </div>
                                        <div className="mb-2">
                                            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 'x-small', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Policy Type</p>
                                            <p className="fw-bold mb-0" style={{ color: '#f8fafc', fontSize: 'small' }}>{ins.type}</p>
                                        </div>
                                        <div className="mb-2">
                                            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 'x-small', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Policy ID</p>
                                            <p className="fw-bold mb-0" style={{ color: '#c7d2fe', fontSize: 'small' }}>{ins.policy}</p>
                                        </div>
                                        <hr className="opacity-10" />
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 'x-small', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Premium</p>
                                                <p className="fw-bold text-success mb-0" style={{ fontSize: 'small' }}>{ins.premium}</p>
                                            </div>
                                            <div className="text-end">
                                                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 'x-small', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Expires</p>
                                                <p className="fw-bold mb-0" style={{ color: '#f8fafc', fontSize: 'small' }}>{ins.expiry}</p>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* Edit Modal */}
                <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                    <Modal.Header closeButton className="border-0">
                        <Modal.Title className="fw-bold"><FaEdit className="me-2 text-primary" />Edit User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="px-4 pb-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Full Name</Form.Label>
                            <Form.Control value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-pill" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Email</Form.Label>
                            <Form.Control type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="rounded-pill" />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold">User Role</Form.Label>
                            <Form.Select
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="rounded-pill"
                                style={{ background: '#f8fafc' }}
                            >
                                <option value="user">User</option>
                                <option value="officer">Officer</option>
                                <option value="admin">Admin</option>
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex gap-2">
                            <Button variant="light" className="rounded-pill flex-grow-1" onClick={() => setShowEdit(false)}>
                                <FaTimes className="me-1" /> Cancel
                            </Button>
                            <Button variant="primary" className="rounded-pill flex-grow-1" onClick={handleUpdate} disabled={updating}>
                                {updating ? <Spinner animation="border" size="sm" /> : <><FaCheckCircle className="me-1" /> Save Changes</>}
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>

                {/* Delete Confirm Modal */}
                <Modal show={showDelete} onHide={() => setShowDelete(false)} centered size="sm">
                    <Modal.Body className="text-center p-4">
                        <div className="bg-danger-subtle text-danger rounded-circle p-3 d-inline-block mb-3 fs-3">
                            <FaTrashAlt />
                        </div>
                        <h5 className="fw-bold mb-2">Delete User?</h5>
                        <p className="text-muted small mb-4">
                            Are you sure you want to remove <strong>{selectedUser?.fullName}</strong>? This action cannot be undone.
                        </p>
                        <div className="d-flex gap-2">
                            <Button variant="light" className="rounded-pill flex-grow-1" onClick={() => setShowDelete(false)}>Cancel</Button>
                            <Button variant="danger" className="rounded-pill flex-grow-1" onClick={handleDelete}>Delete</Button>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    );
};

export default AdminUsers;
