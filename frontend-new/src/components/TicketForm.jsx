import React, { useState } from 'react';
import API from '../api';

const TicketForm = ({ onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Software');
  const [priority, setPriority] = useState('Medium');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tickets', { title, description, category, priority });
      setTitle(''); setDescription(''); setCategory('Software'); setPriority('Medium');
      if (onCreated) onCreated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create ticket');
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3>Create Ticket</h3>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
      <div className="row">
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Software</option>
          <option>Hardware</option>
          <option>Network</option>
          <option>Other</option>
        </select>
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>
      <button className="btn-primary" type="submit">Create</button>
    </form>
  );
};

export default TicketForm;
