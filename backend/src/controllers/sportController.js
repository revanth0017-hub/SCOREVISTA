import Sport from '../models/Sport.js';

export async function list(req, res, next) {
  try {
    const { active } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === 'true';
    const list = await Sport.find(filter).sort({ name: 1 }).lean();
    res.json({ success: true, data: list, message: 'Sports fetched' });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const isId = /^[0-9a-fA-F]{24}$/.test(id);
    const doc = await Sport.findOne(isId ? { _id: id } : { slug: id }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Sport not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { name, slug, icon, description, isActive } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const doc = await Sport.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      icon,
      description,
      isActive: isActive !== false,
    });
    res.status(201).json({ success: true, data: doc, message: 'Sport created' });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await Sport.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Sport not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await Sport.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Sport not found' });
    res.json({ success: true, message: 'Sport deleted' });
  } catch (err) {
    next(err);
  }
}
