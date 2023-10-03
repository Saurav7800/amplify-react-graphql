//add the Storage class and Image component to your Amplify imports:
import { API, Storage } from 'aws-amplify';
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from '@aws-amplify/ui-react';

//Update the fetchNotes function to fetch an image if there is an image associated with a note:
async function fetchNotes() {
  const apiData = await API.graphql({ query: listNotes });
  const notesFromAPI = apiData.data.listNotes.items;
  await Promise.all(
    notesFromAPI.map(async (note) => {
      if (note.image) {
        const url = await Storage.get(note.name);
        note.image = url;
      }
      return note;
    })
  );
  setNotes(notesFromAPI);
}

//Update the createNote function to add the image to the local image array if an image is associated with the note:
async function createNote(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const image = form.get("image");
  const data = {
    name: form.get("name"),
    description: form.get("description"),
    image: image.name,
  };
  if (!!data.image) await Storage.put(data.name, image);
  await API.graphql({
    query: createNoteMutation,
    variables: { input: data },
  });
  fetchNotes();
  event.target.reset();
}

//Update the deleteNote function to delete files from storage when notes are deleted:
async function deleteNote({ id, name }) {
  const newNotes = notes.filter((note) => note.id !== id);
  setNotes(newNotes);
  await Storage.remove(name);
  await API.graphql({
    query: deleteNoteMutation,
    variables: { input: { id } },
  });
}

//Add an additional input to the form in the return block:
<View
  name="image"
  as="input"
  type="file"
  style={{ alignSelf: "end" }}
/>

//When mapping over the notes array, render an image if it exists:
{notes.map((note) => (
  <Flex
    key={note.id || note.name}
    direction="row"
    justifyContent="center"
    alignItems="center"
  >
    <Text as="strong" fontWeight={700}>
      {note.name}
    </Text>
    <Text as="span">{note.description}</Text>
    {note.image && (
      <Image
        src={note.image}
        alt={`visual aid for ${notes.name}`}
        style={{ width: 400 }}
      />
    )}
    <Button variation="link" onClick={() => deleteNote(note)}>
      Delete note
    </Button>
  </Flex>
))}

