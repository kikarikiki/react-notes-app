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

    // Helper Function
    // assigns the first note in the notes array (retrieved with notes[0]) to currentNote
    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

    // Sort notes according to newestUpdated
    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt)

    const [tempNoteText, setTempNoteText] = React.useState("")

    /////////////////////////////

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

    /////////////////////////////

    React.useEffect(() => {
      if (!currentNoteId) {
          setCurrentNoteId(notes[0]?.id)
      }
  }, [notes])

    /////////////////////////////

    React.useEffect(() => {
        currentNote && setTempNoteText(currentNote.body)
    }, [currentNote])

    /////////////////////////////

    // Any time 'tempNoteText changes' (every single key stroke), this-useEffect will run
    React.useEffect(() => {
      // Debouncing happens with timeOutFunction
      // will wait 500ms before updating 'tempNoteText' in Firestore
      const timeoutId = setTimeout(() => {
        // if tempNoteText is not equal to currentNote.body
        if (tempNoteText !== currentNote.body) {
          // ... will run updateNote()
          // (this way selecting the next note isn't goint to trigger the update),
          // bc currentNote.body is equal tempNoteText
          updateNote(tempNoteText)
        }
      }, 500)
       // cleaning (canceling setTimeout()) happens after 'tempNoteText' was updated
       // (useEffectFunction will run again)
      return () => clearTimeout(timeoutId)
  }, [tempNoteText])




    // CREATE NEW NOTE
    async function createNewNote() {

      const newNote = {
          body: "# Type your markdown note's title here",
          // database manages id, so we dont need to create a prop for it
          createdAt: Date.now(),
          updatedAt: Date.now()
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
      await setDoc(docRef, { body: text, updatedAt: Date.now() }, { merge: true })
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
                    notes={sortedNotes}
                    currentNote={currentNote}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                    deleteNote={deleteNote}
                />
                <Editor
                    tempNoteText={tempNoteText}
                    setTempNoteText={setTempNoteText}
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
