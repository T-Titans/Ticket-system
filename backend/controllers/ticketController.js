import { create, find, findById } from '../models/Ticket';

const createTicket = async (req, res) => {
  const ticket = await create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(ticket);
};

const getTickets = async (req, res) => {
  let tickets;
  if (req.user.role === 'agent') tickets = await find().populate('createdBy assignedTo');
  else tickets = await find({ createdBy: req.user._id });
  res.json(tickets);
};

const updateTicket = async (req, res) => {
  const ticket = await findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  Object.assign(ticket, req.body);
  await ticket.save();
  res.json(ticket);
};

export default { createTicket, getTickets, updateTicket };
