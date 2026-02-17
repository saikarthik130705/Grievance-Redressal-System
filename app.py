from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db
from models import User, Ticket, OfficerComplaint

app = Flask(__name__)
CORS(app)

# SQLite config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tickets.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()


# ================= HOME =================
@app.route("/")
def home():
    return "Ticket API running"


# ================= USER ROUTES =================
@app.route("/users", methods=["POST"])
def create_user():
    data = request.json

    if not data:
        return jsonify({"error": "No data provided"}), 400

    user = User(
        name=data.get("name"),
        email=data.get("email"),
        password=data.get("password"),
        role=data.get("role"),
        joined=data.get("joined", "")
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@app.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])


# ================= TICKET ROUTES =================
@app.route("/tickets", methods=["POST"])
def create_ticket():
    data = request.json

    if not data:
        return jsonify({"error": "No data provided"}), 400

    ticket = Ticket(
        name=data.get("name", "Citizen"),
        description=data.get("description"),
        image=data.get("image", ""),
        location=data.get("location", ""),
        status=data.get("status", "Pending"),
        created_by=data.get("created_by", "")
    )

    db.session.add(ticket)
    db.session.commit()

    return jsonify(ticket.to_dict()), 201


@app.route("/tickets", methods=["GET"])
def get_tickets():
    tickets = Ticket.query.all()
    return jsonify([t.to_dict() for t in tickets])


@app.route("/tickets/<int:ticket_id>", methods=["GET"])
def get_ticket(ticket_id):
    ticket = Ticket.query.get_or_404(ticket_id)
    return jsonify(ticket.to_dict())


# ================= OFFICER COMPLAINT ROUTES =================
@app.route("/complaints", methods=["POST"])
def create_complaint():
    try:
        data = request.json

        if not data:
            return jsonify({"error": "No data provided"}), 400

        complaint = OfficerComplaint(
            officer_name=data.get("officerName"),
            department=data.get("department"),
            description=data.get("description"),
            location=data.get("location"),
            status=data.get("status", "Under Review"),
            reported_by=data.get("reportedBy"),
            date=data.get("date")
        )

        db.session.add(complaint)
        db.session.commit()

        return jsonify(complaint.to_dict()), 201

    except Exception as e:
        print("COMPLAINT ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/complaints", methods=["GET"])
def get_complaints():
    complaints = OfficerComplaint.query.all()
    return jsonify([c.to_dict() for c in complaints])


# ================= UPDATE TICKET STATUS =================
@app.route("/tickets/<int:id>", methods=["PUT"])
def update_ticket(id):
    data = request.json
    ticket = Ticket.query.get(id)

    if not ticket:
        return jsonify({"message": "Ticket not found"}), 404

    ticket.status = data.get("status", ticket.status)
    db.session.commit()

    return jsonify({"message": "Ticket updated"})


# ================= UPDATE COMPLAINT STATUS =================
@app.route("/complaints/<int:id>", methods=["PUT"])
def update_complaint(id):
    data = request.json
    complaint = OfficerComplaint.query.get(id)

    if not complaint:
        return jsonify({"message": "Complaint not found"}), 404

    complaint.status = data.get("status", complaint.status)
    db.session.commit()

    return jsonify({"message": "Complaint updated"})


# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)

