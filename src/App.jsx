import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import { data } from "../data"
import Split from "react-split"
import {nanoid} from "nanoid"

export default function App() {

    const [notes, setNotes] = React.useState(
        // 1. Lazy State Inititialization
        // 2. Access LocalStorage to preload App with prev Notes of LocalStorage
        () => JSON.parse(localStorage.getItem("notes")) || []
    )
    const [currentNoteId, setCurrentNoteId] = React.useState(
        (notes[0] && notes[0].id) || ""
    )

    // Side Effect to connect to LocalStorage
    React.useEffect(() => {
      // Updating 'notes'-key inside of LocalStorage by stringifying 'notes'-array
      // in order to save it to localStorage
      localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes]) // dependent on 'notes': function runs every time 'notes'- array changes

    function createNewNote() {
        const newNote = {
            id: nanoid(),
            body: "# Type your markdown note's title here"
        }
        setNotes(prevNotes => [newNote, ...prevNotes])
        setCurrentNoteId(newNote.id)
    }

    function updateNote(text) {
      // Rearrange the most recently-modified
      // note to be at the top
      setNotes(oldNotes => {
          // Create a new empty array
          const newArr = []

          // Loop over the original array
            for(let i = 0; i < oldNotes.length; i++) {
              const oldNote = oldNotes[i]
              // if the id matches
              if(oldNote.id === currentNoteId) {
                // put the updated note at the
                // beginning of the new array
                newArr.unshift({ ...oldNote, body: text })
                // else
              } else {
                // push the old note to the end
                // of the new array
                newArr.push(oldNote)
              }
            }
            // return the new array
            return newArr
      })

      // This does not rearrange the notes
      // setNotes(oldNotes => oldNotes.map(oldNote => {
      //     return oldNote.id === currentNoteId
      //         ? { ...oldNote, body: text }
      //         : oldNote
      // }))
  }

    function findCurrentNote() {
        return notes.find(note => {
            return note.id === currentNoteId
        }) || notes[0]
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
                    currentNote={findCurrentNote()}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                />
                {
                    currentNoteId &&
                    notes.length > 0 &&
                    <Editor
                        currentNote={findCurrentNote()}
                        updateNote={updateNote}
                    />
                }
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
