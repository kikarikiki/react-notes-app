import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
// Listen to changes in the firestore database and act accordingly in my localCode
import { onSnapshot, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore"
import { notesCollection, db } from "./firebase"

export default function App() {

    const [notes, setNotes] = React.useState([])

    const [currentNoteId, setCurrentNoteId] = React.useState("")

    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

    // DateNow
    const formattedDateNow = new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(new Date());


    // SIDE EFFECT TO CONNECT TO FIRESTORE
    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function(snapshot) {
            // Sync up our local notes array with the snapshot data
            // Getting snapshot-dataObjects from firestore and rearanging it so that it can be used
            // for this app
            const notesArr = snapshot.docs.map(doc => ({
              // for every doc return an object that has all data from docs
              ...doc.data(),
              // id is not part of the data of the document.
              // document has its own id property that i can access with doc.id
              id: doc.id
          }))
          // Call stateFunction and pass notesArr-Array
          setNotes(notesArr)
        })
        return unsubscribe
    }, [])




    // CREATE NEW NOTE
    async function createNewNote() {

      const newNote = {
          body: "# Type your markdown note's title here",
          // database manages id, so we dont need to create a prop for it
          createdAt: formattedDateNow,
          updatedAt: ""
      }
      // Push newNote to Firestore with addDoc
      const newNoteRef = await addDoc(notesCollection, newNote)
      // set Id to newNoteRef-Referenz.id property
      setCurrentNoteId(newNoteRef.id)
    }


    // UPDATE NOTE
    async function updateNote(text) {
      const docRef = doc(db, "notes", currentNoteId)
      // Pushing update/changes (currentNoteId) to Firestore
      // merge: true -> merge modified object into exsiting object/doc in firestore
      console.log(docRef)
      await setDoc(docRef, { body: text, updatedAt: formattedDateNow }, { merge: true })
  }


    // DELETE NOTE
    async function deleteNote(noteId) {
        const docRef = doc(db, "notes", noteId)
        await deleteDoc(docRef)
    }


    return (
        <main>
        {
            notes.length > 0
            ?
            <Split
                sizes={[30, 70]}
                direction="horizontal"
                className="split"
            >
                <Sidebar
                    notes={notes}
                    currentNote={currentNote}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                    deleteNote={deleteNote}
                />
                <Editor
                    currentNote={currentNote}
                    updateNote={updateNote}
                />
            </Split>
            :
            <div className="no-notes">
                <h1>You have no notes</h1>
                <button
                    className="first-note"
                    onClick={createNewNote}
                >
                    Create one now
                </button>
            </div>

        }
        </main>
    )
}
