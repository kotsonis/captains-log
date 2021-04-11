import * as React from 'react'
// use react-jsonschema-form for easy form creation
// import Form from "@rjsf/core";
import {Location, History} from "history";
import Auth from '../auth/Auth'
import { getEntry } from '../api/journal-api'
import { deleteEntry, patchEntry} from '../api/journal-api'
import 'semantic-ui-css/semantic.min.css'
import { Form, Label, Rating, RatingProps, Grid, Segment, Image, TextArea, Placeholder, Container} from 'semantic-ui-react'
import { Button, ButtonProps, Icon, TextAreaProps } from 'semantic-ui-react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {parseISOString } from '../libs/parsedate'
import {Entry } from '../types/Entry'
import {UpdateEntryRequest} from '../types/UpdateEntryRequest'
import './CreateJournalEntry.css';


interface CreateJournalProps {
  match: {
    params: {
      entryId: string
    }
  }
  auth: Auth;
  location: Location
  history: History
}

interface CreateJournalState {
  entryId: string
  headline: string
  description: string
  entryDate: Date
  mood: number
  imageUrl?: string
  loading: boolean
  dirty: boolean
  hasImage: boolean
}

export class CreateJournal extends React.PureComponent<
  CreateJournalProps,
  CreateJournalState
> {
  state: CreateJournalState = {
    entryId: '',
    headline: '',
    description: '',
    // entryDate: (this.props.location.state as JournalDbEntry).entryDate
    entryDate: new Date(),
    mood: 2,
    imageUrl: '',
    loading: true,
    dirty: false,
    hasImage: false
  }
/*  constructor(props: CreateJournalProps) {
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
        entryDate: parseISOString(entry.entryDate),
        mood: entry.mood,
        imageUrl: entry.attachmentUrl || '',
        loading: false,
        hasImage: entryHasImage
      })
    } catch (e) {
      alert(`Failed to fetch entry: ${e.message}`)
    }
  }

  onDateChange = (date: any) => {
    this.setState({
      entryDate: date,
      dirty: true
    })
  }
  onUndoChanges = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) => {
    if (this.state.dirty) {
      if(!window.confirm('Entry has changes!\n Are you sure?')) {
        return
      }
    }
    this.props.history.push(`/`)
  }
  onDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
    this.setState({
      description: data.value as string,
      dirty: true
    })
  }

  handleHeadlineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
    this.setState({
      headline: event.target.value,
      dirty: true
    })
  }
  handleRatingChange = (event: React.SyntheticEvent, data: RatingProps) => {
    console.log(data.rating)
    this.setState({
      mood: data.rating as number,
      dirty: true
    })
  }
  onEditButtonClick = (entryId: string) => {
    console.log(`Got into EditButton with entry id ${entryId}`)
    this.props.history.push(`/entries/${entryId}/edit`)
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

  onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.dirty) {
        alert('No modifications to save')
        return
      }
      const entry:UpdateEntryRequest = {
        entryDate: this.state.entryDate.toISOString(),
        headline: this.state.headline,
        description: this.state.description,
        mood: this.state.mood
      }
      await patchEntry(this.props.auth.getIdToken(), this.state.entryId, entry)
      
      alert('Entry was updated!')
    } catch (e) {
      alert('Could not update entry: ' + e.message)
    } finally {
      this.props.history.goBack();
    }
  }

  render() {
    return (
      <div>
        <h1>Update Journal Entry Details</h1>
        <Segment raised>
          <Label color='blue' ribbon>
            Headline
          </Label>
          <Form>
          <Form.Input type='text' value={this.state.headline} onChange={this.handleHeadlineChange} />
          </Form>
          
        </Segment>
        <Grid columns={2}>
    <Grid.Column width={11}>
      <Segment raised>
        <Label color='red' ribbon>
          Rating
        </Label>
        <span>How was this day?</span>
        <Container textAlign='right'>
          <Rating
            icon="heart"
            rating={this.state.mood}
            maxRating={5}
            onRate={this.handleRatingChange}
            />
            </Container>
        </Segment>
        <Segment>
        <Label color='blue' ribbon>
          Journal
        </Label>
        <span>What happened today?</span>
        <Form>
        <TextArea
        style={{ minHeight: 380 }}
        placeholder="I finally reached another solar system..."
        value = {this.state.description}
        onChange = {this.onDescriptionChange}
        rows='10'
        />
        </Form>
        
      </Segment>
    </Grid.Column>
    <Grid.Column width={5}>
      <Segment raised>
      <Label color='red' ribbon='right'>
          Date
        </Label>
        <span>Select date</span>
        <DatePicker className="datePick"
          selected = {this.state.entryDate}
          onChange = {this.onDateChange}
          dateFormat = 'P'
          inline
        />
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
        <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(this.state.entryId)}
                >
                  <Icon name="pencil" />
                </Button>
      </Segment>
    </Grid.Column>
      </Grid>

      <Grid columns={3}>
        <Grid.Column>
        <Button 
          content='Save Changes' 
          icon='save' 
          labelPosition='left' 
          onClick={this.onSubmit}
          />
        </Grid.Column>
      <Grid.Column>
      <Button 
      content='Cancel Changes' 
      icon='undo' 
      labelPosition='left' 
      onClick={this.onUndoChanges}/>
      </Grid.Column>
    <Grid.Column>
    <Button 
    content='Delete Entry' 
    icon='trash alternate' 
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

