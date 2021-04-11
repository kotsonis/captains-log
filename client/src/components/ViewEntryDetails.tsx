import * as React from 'react'
// use react-jsonschema-form for easy form creation
// import Form from "@rjsf/core";
import {Location, History} from "history";
import Auth from '../auth/Auth'
import { getEntry } from '../api/journal-api'
import { deleteEntry, patchEntry} from '../api/journal-api'
import 'semantic-ui-css/semantic.min.css'
import { Label, Rating, Grid, Segment, Image, Placeholder, Container} from 'semantic-ui-react'
import { Button, ButtonProps } from 'semantic-ui-react'
import "react-datepicker/dist/react-datepicker.css";
import { shortDate } from '../libs/parsedate'
import {Entry } from '../types/Entry'
import './ViewJournalEntry.css';


interface ViewJournalProps {
  match: {
    params: {
      entryId: string
    }
  }
  auth: Auth;
  location: Location
  history: History
}

interface ViewJournalState {
  entryId: string
  headline: string
  description: string
  entryDate: string
  mood: number
  imageUrl?: string
  loading: boolean
  dirty: boolean
  hasImage: boolean
}

export class ViewJournal extends React.PureComponent<
  ViewJournalProps,
  ViewJournalState
> {
  state: ViewJournalState = {
    entryId: '',
    headline: '',
    description: '',
    // entryDate: (this.props.location.state as JournalDbEntry).entryDate
    entryDate: '',
    mood: 2,
    imageUrl: '',
    loading: true,
    dirty: false,
    hasImage: false
  }
/*  constructor(props: ViewJournalProps) {
    super(props)
    this.handleHeadlineChange = this.handleHeadlineChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.undoChanges = this.undoChanges.bind(this);

  }
  */
  async componentDidMount() {
    try {
      const entry:Entry = await getEntry(this.props.auth.getIdToken(), this.props.match.params.entryId)
      console.log('Got below entry')
      console.log(entry)
      let entryHasImage:boolean = false
      if (entry.hasOwnProperty('attachmentUrl')) {
        console.log(`entry has image url ${entry.attachmentUrl}`)
        entryHasImage = true
      }
      this.setState({
        entryId: this.props.match.params.entryId,
        headline: entry.headline,
        description: entry.description,
        entryDate: shortDate(entry.entryDate),
        mood: entry.mood,
        imageUrl: entry.attachmentUrl || '',
        loading: false,
        hasImage: entryHasImage
      })
    } catch (e) {
      alert(`Failed to fetch entry: ${e.message}`)
    }
  }

  onDone = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    this.props.history.goBack();
  }

  onEditButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    this.props.history.push(`/entries/${this.state.entryId}/create`)
  }
    /*
    this.setState(prevState => ({
      entry: {
        ...prevState.entry,
        hasSunRoof: event.target.value,
      }
    }))
  } */
  onEntryDelete = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    try {
      await deleteEntry(this.props.auth.getIdToken(), this.state.entryId)
      this.props.history.push({
        pathname: `/`
      })
    } catch {
      alert('Journal Entry deletion failed')
    }
  }


  render() {
    return (
      <div>
        <h1>Journal Entry Details</h1>
        <Segment raised>
          <Label color='blue' ribbon>
            Headline
          </Label>
          {this.state.headline}
        </Segment>
        <Grid columns={2}>
    <Grid.Column width={11}>
      <Segment raised>
        <Label color='red' ribbon>
          Rating
        </Label>
        <Container textAlign='right'>
          <Rating
            icon="heart"
            disabled={true}
            rating={this.state.mood}
            maxRating={5}
            />
            </Container>
        </Segment>
        <Segment>
        <Label color='blue' ribbon>
          Journal
        </Label>
        {this.state.description}
      </Segment>
    </Grid.Column>
    <Grid.Column width={5}>
      <Segment raised>
      <Label color='red' ribbon='right'>
          Date
        </Label>
         {this.state.entryDate}
          
      </Segment>
      <Segment raised>
        <Label as='a' color='olive' ribbon='right'>
         Image
        </Label>
        <p>
        Picture of the day
        </p>
        
        {this.state.hasImage ? (
                <Image className="entryImage" style={{ height: 150, width: 150 }} src={this.state.imageUrl} size="medium" wrapped  />
              ):(
                <Placeholder style={{ height: 150, width: 150}}>
                  <Placeholder.Image square size="medium" />
                </Placeholder>
              ) }
      </Segment>
    </Grid.Column>
      </Grid>

      <Grid columns={3}>
        <Grid.Column>
        <Button 
          content='Edit Entry' 
          icon='edit' 
          labelPosition='left' 
          onClick={this.onEditButtonClick}
          />
        </Grid.Column>
      <Grid.Column>
      <Button 
      content='Back' 
      icon='arrow circle left' 
      labelPosition='left' 
      onClick={this.onDone}/>
      </Grid.Column>
    <Grid.Column>
    <Button 
    content='Delete Entry' 
    icon='trash' 
    labelPosition='left'
    onClick={this.onEntryDelete} />
    </Grid.Column>
    
      </Grid>
    
    </div >
    )
    /* console.log(this.props.location.state)
    const formData = this.props.location.state;
    return (
      <div>
      <h1>Update Journal Entry</h1>
        <Form schema={jsonSchema}
        formData = {formData}
        uiSchema = {uiSchema}
          onChange={log("changed")}
        onSubmit={log("submitted")}
        onError={log("errors")} />
        </div>
    ) */
  }

}

