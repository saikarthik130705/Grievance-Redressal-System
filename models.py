from database import db

# ================= USERS =================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    role = db.Column(db.String(50))
    joined = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "role": self.role,
            "joined": self.joined
        }



# ================= TICKETS =================
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500))
    image = db.Column(db.String(300))
    location = db.Column(db.String(300))
    status = db.Column(db.String(50), default="Pending")
    created_by = db.Column(db.String(150))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "image": self.image,
            "location": self.location,
            "status": self.status,
            "created_by": self.created_by
        }


# ================= OFFICER COMPLAINTS =================
class OfficerComplaint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    officer_name = db.Column(db.String(150), nullable=False)
    department = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(500))
    location = db.Column(db.String(300))
    status = db.Column(db.String(50), default="Under Review")
    reported_by = db.Column(db.String(150))
    date = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id": self.id,
            "officer_name": self.officer_name,
            "department": self.department,
            "description": self.description,
            "location": self.location,
            "status": self.status,
            "reported_by": self.reported_by,
            "date": self.date
        }
