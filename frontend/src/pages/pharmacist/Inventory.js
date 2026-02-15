import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import { pharmacistService } from '../../services/pharmacistService';
import { Package, Plus } from 'lucide-react';

const statusOptions = ['REQUESTED', 'PROCESSING', 'READY', 'DISPENSED', 'REJECTED'];

const defaultItem = {
  medicineName: '',
  batchNumber: '',
  quantity: 0,
  price: 0,
  expiryDate: ''
};

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [itemForm, setItemForm] = useState(defaultItem);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [inventoryResponse, ordersResponse] = await Promise.all([
        pharmacistService.getInventory(),
        pharmacistService.getPendingOrders()
      ]);
      setInventory(inventoryResponse.data || []);
      setOrders(ordersResponse.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  };

  const saveInventoryItem = async (event) => {
    event.preventDefault();
    try {
      await pharmacistService.addInventoryItem({
        ...itemForm,
        expiryDate: itemForm.expiryDate ? `${itemForm.expiryDate}T23:59:00` : null
      });
      setMessage('Inventory item added.');
      setItemForm(defaultItem);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to add inventory item.');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await pharmacistService.fulfillOrder(orderId, { status });
      setMessage(`Order updated to ${status}.`);
      fetchData();
    } catch (err) {
      setError('Failed to update refill status.');
    }
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Inventory Management</h1>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} />
              Add Inventory
            </button>
          </div>
        </div>

        {message && <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(16,185,129,0.4)' }}>{message}</div>}
        {error && <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(239,68,68,0.4)' }}>{error}</div>}

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Pending Refill Requests</h2>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}><div className="spinner"></div></div>
          ) : orders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No pending refill requests.</p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Prescription</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.patient?.name || '-'}</td>
                      <td>{order.prescription?.id || '-'}</td>
                      <td>{order.status}</td>
                      <td>
                        <select className="input" value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Inventory Items</h2>
          {inventory.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
              <Package size={38} style={{ opacity: 0.35, marginBottom: '0.5rem' }} />
              <p>No inventory items yet.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Batch</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.medicineName}</td>
                      <td>{item.batchNumber}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Add Inventory Item</h2>
              </div>
              <form onSubmit={saveInventoryItem}>
                <div className="input-group">
                  <label className="input-label">Medicine Name</label>
                  <input className="input" value={itemForm.medicineName} onChange={(e) => setItemForm((prev) => ({ ...prev, medicineName: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Batch Number</label>
                    <input className="input" value={itemForm.batchNumber} onChange={(e) => setItemForm((prev) => ({ ...prev, batchNumber: e.target.value }))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Quantity</label>
                    <input className="input" type="number" min="0" value={itemForm.quantity} onChange={(e) => setItemForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Price</label>
                    <input className="input" type="number" min="0" step="0.01" value={itemForm.price} onChange={(e) => setItemForm((prev) => ({ ...prev, price: Number(e.target.value) }))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Expiry Date</label>
                    <input className="input" type="date" value={itemForm.expiryDate} onChange={(e) => setItemForm((prev) => ({ ...prev, expiryDate: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Item</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inventory;
