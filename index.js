const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const noteCollection = client.db("Note-App").collection("notes");

  
    //post note
    app.post("/notes", async (req, res) => {
      try {
        const note = req.body;
        const result = await noteCollection.insertOne(note);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get note for  specific user
    app.get("/notes", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }
        const result = await noteCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //get notification
    app.get("/notification", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }

        const notes = await noteCollection.find(query).toArray();

        const sortednotes = notes.sort(
          (a, b) => new Date(b.deadline) - new Date(a.deadline)
        );

        const mostRecentnote = sortednotes[0];

        res.send({ mostRecentnote });
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    //get a note
    app.get("/notes/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await noteCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //update a note
    app.patch("/update-note/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const note = req.body;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            title: note.title,
            description: note.description,
            deadline: note.deadline,
            priority: note.priority,
          },
        };
        console.log(updatedDoc);
        const result = await noteCollection.updateOne(filter, updatedDoc);
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //update a note status
    app.put("/update-status/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const { status } = req.body;
        console.log(status);
        const updatedDoc = {
          $set: {
            status: status,
          },
        };
        const result = await noteCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //delete reviews
    app.delete("/notes/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await noteCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("note app is running....");
});

app.listen(port, (req, res) => {
  console.log(`note app is running on ${port}`);
});
