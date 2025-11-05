
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import { USERS, INITIAL_JOURNAL_ENTRIES, INITIAL_JOURNAL_CATEGORIES } from "./constants";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// --- AUTH ---
app.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const queryByNip = db.collection('users').where('nip', '==', identifier);
    const queryByNisn = db.collection('users').where('nisn', '==', identifier);
    const queryByNik = db.collection('users').where('nik', '==', identifier);

    const [nipSnapshot, nisnSnapshot, nikSnapshot] = await Promise.all([
        queryByNip.get(),
        queryByNisn.get(),
        queryByNik.get()
    ]);

    const userDoc = nipSnapshot.docs[0] || nisnSnapshot.docs[0] || nikSnapshot.docs[0];

    if (!userDoc) {
        return res.status(401).json({ message: "Pengguna tidak ditemukan." });
    }

    const user = userDoc.data();

    if (user.password !== password) {
      return res.status(401).json({ message: "Kata sandi salah." });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({ id: userDoc.id, ...userWithoutPassword });

  } catch (error) {
    functions.logger.error("Login Error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});


// --- USERS ---
app.get("/users", async (req, res) => {
    try {
        const snapshot = await db.collection("users").get();
        const users = snapshot.docs.map(doc => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...user } = doc.data();
            return { id: doc.id, ...user };
        });
        res.status(200).json(users);
    } catch (error) {
        functions.logger.error("Get Users Error:", error);
        res.status(500).json({ message: "Failed to get users." });
    }
});

app.post("/users", async (req, res) => {
    try {
        const newUser = req.body;
        const docRef = await db.collection("users").add(newUser);
        res.status(201).json({ id: docRef.id, ...newUser });
    } catch (error) {
        functions.logger.error("Create User Error:", error);
        res.status(500).json({ message: "Failed to create user." });
    }
});

app.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = req.body;
        await db.collection("users").doc(id).set(updatedUser, { merge: true });
        res.status(200).json({ id, ...updatedUser });
    } catch (error) {
        functions.logger.error("Update User Error:", error);
        res.status(500).json({ message: "Failed to update user." });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection("users").doc(id).delete();
        res.status(204).send();
    } catch (error) {
        functions.logger.error("Delete User Error:", error);
        res.status(500).json({ message: "Failed to delete user." });
    }
});


// --- JOURNALS ---
app.get("/journals", async (req, res) => {
    try {
        const snapshot = await db.collection("journals").orderBy("date", "desc").get();
        const journals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(journals);
    } catch (error) {
        functions.logger.error("Get Journals Error:", error);
        res.status(500).json({ message: "Failed to get journals." });
    }
});

app.post("/journals", async (req, res) => {
    try {
        const newJournal = { 
            ...req.body, 
            date: new Date().toISOString(),
            submissionTime: new Date().toLocaleTimeString('en-GB') 
        };
        const docRef = await db.collection("journals").add(newJournal);
        res.status(201).json({ id: docRef.id, ...newJournal });
    } catch (error) {
        functions.logger.error("Create Journal Error:", error);
        res.status(500).json({ message: "Failed to create journal." });
    }
});

app.put("/journals/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedJournal = req.body;
        await db.collection("journals").doc(id).set(updatedJournal, { merge: true });
        res.status(200).json({ id, ...updatedJournal });
    } catch (error) {
        functions.logger.error("Update Journal Error:", error);
        res.status(500).json({ message: "Failed to update journal." });
    }
});

app.delete("/journals/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection("journals").doc(id).delete();
        res.status(204).send();
    } catch (error) {
        functions.logger.error("Delete Journal Error:", error);
        res.status(500).json({ message: "Failed to delete journal." });
    }
});


// --- CATEGORIES ---
app.get("/journal-categories", async (req, res) => {
    try {
        const doc = await db.collection("app-data").doc("journal-categories").get();
        if (!doc.exists) {
            return res.status(404).json({ message: "Journal categories not found." });
        }
        res.status(200).json(doc.data()?.categories || []);
    } catch (error) {
        functions.logger.error("Get Categories Error:", error);
        res.status(500).json({ message: "Failed to get journal categories." });
    }
});

// --- SEED DATA ---
app.post("/seed-data", async (req, res) => {
  try {
    const batch = db.batch();

    // Seed users
    const usersCollection = db.collection("users");
    const usersSnapshot = await usersCollection.get();
    if (usersSnapshot.empty) {
        USERS.forEach(user => {
            const docRef = usersCollection.doc();
            batch.set(docRef, user);
        });
        functions.logger.info("Seeding users...");
    } else {
        functions.logger.info("Users collection is not empty, skipping seeding.");
    }

    // Seed journals
    const journalsCollection = db.collection("journals");
    const journalsSnapshot = await journalsCollection.get();
    if (journalsSnapshot.empty) {
        INITIAL_JOURNAL_ENTRIES.forEach(entry => {
            const docRef = journalsCollection.doc();
            batch.set(docRef, entry);
        });
        functions.logger.info("Seeding journals...");
    } else {
         functions.logger.info("Journals collection is not empty, skipping seeding.");
    }
    
    // Seed categories
    const categoriesDoc = db.collection("app-data").doc("journal-categories");
    const categoriesSnapshot = await categoriesDoc.get();
    if (!categoriesSnapshot.exists) {
        batch.set(categoriesDoc, { categories: INITIAL_JOURNAL_CATEGORIES });
        functions.logger.info("Seeding journal categories...");
    } else {
        functions.logger.info("Journal categories already exist, skipping seeding.");
    }

    await batch.commit();
    res.status(200).send("Data seeding process completed.");

  } catch (error) {
    functions.logger.error("Seed Data Error:", error);
    res.status(500).json({ message: "Failed to seed data." });
  }
});

// Expose Express API as a single Cloud Function
export const api = functions.https.onRequest(app);
