
const { v4: uuidv4 } = require('uuid');

class Issue {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.employeeUuid = data.employeeUuid;
    this.typeId = data.typeId;
    this.subTypeId = data.subTypeId;
    this.description = data.description;
    this.status = data.status || 'open';
    this.priority = data.priority || 'medium';
    this.assignedTo = data.assignedTo;
    this.attachmentUrl = data.attachmentUrl;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.closedAt = data.closedAt;
  }

  static fromDatabase(row) {
    return new Issue({
      id: row.id,
      employeeUuid: row.employee_uuid,
      typeId: row.type_id,
      subTypeId: row.sub_type_id,
      description: row.description,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assigned_to,
      attachmentUrl: row.attachment_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      closedAt: row.closed_at
    });
  }
}

module.exports = Issue;
