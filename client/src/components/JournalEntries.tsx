import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Label,
  Form,
  Rating
} from 'semantic-ui-react'
import './JournalEntries.css';
import { shortDate } from '../libs/parsedate'

import { createEntry, deleteEntry, getEntries, patchEntry} from '../api/journal-api'
import Auth from '../auth/Auth'
import { Entry } from '../types/Entry'

interface EntriesProps {
  auth: Auth
  history: History
}

interface EntriesState {
  entries: Entry[]
  newEntryHeadline: string
  loadingEntries: boolean
}

export class Entries extends React.PureComponent<EntriesProps, EntriesState> {
  state: EntriesState = {
    entries: [],
    newEntryHeadline: '',
    loadingEntries: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newEntryHeadline: event.target.value })
  }

  onEditButtonClick = (entryId: string) => {
    this.props.history.push(`/entries/${entryId}/create`)
  }

  onEntryDetails = (entryId:string) => {
    this.props.history.push(`/entries/${entryId}/view`)
  }
  
  onEntryCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      if (/^(?!\s*$).+/.test(this.state.newEntryHeadline) === false) {
        alert('Please enter a headline for this journal entry')
        return 
      }
      const entryDate = new Date().toISOString()
      const newEntry = await createEntry(this.props.auth.getIdToken(), {
        headline: this.state.newEntryHeadline,
        entryDate
      })
      this.setState({
        entries: [...this.state.entries, newEntry],
        newEntryHeadline: ''
      })
      console.log(`Got back ${newEntry.entryDate}`)
      this.props.history.push({
        pathname: `/entries/${newEntry.entryId}/create`,
        state: newEntry
      })
    } catch {
      alert('Journal Entry creation failed')
    }
  }

  onEntryDelete = async (entryId: string) => {
    try {
      await deleteEntry(this.props.auth.getIdToken(), entryId)
      this.setState({
        entries: this.state.entries.filter(entry => entry.entryId !== entryId)
      })
    } catch {
      alert('Journal Entry deletion failed')
    }
  }

  onEntryCheck = async (pos: number) => {
    try {
      const entry = this.state.entries[pos]
      await patchEntry(this.props.auth.getIdToken(), entry.entryId, {
        headline: entry.headline,
        entryDate: entry.entryDate,
        mood: entry.mood
      })
      this.setState({
        entries: update(this.state.entries, {
          [pos]: { mood: { $set: entry.mood } }
        })
      })
    } catch {
      alert('Journal Entry tick failed')
    }
  }

  async componentDidMount() {
    try {
      const entries = await getEntries(this.props.auth.getIdToken())
      this.setState({
        entries,
        loadingEntries: false
      })
    } catch (e) {
      alert(`Failed to fetch entries: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Journal Entries</Header>

        {this.renderCreateEntryInput()}

        {this.renderEntries()}
      </div>
    )
  }

  renderCreateEntryInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Form
          onSubmit={() =>this.onEntryCreate}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Journal Entry Headline',
              onClick: this.onEntryCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Wow, what a day..."
            onChange={this.handleNameChange}
            
          />
          </Form>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderEntries() {
    if (this.state.loadingEntries) {
      return this.renderLoading()
    }

    return this.renderEntriesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Journal Entries
        </Loader>
      </Grid.Row>
    )
  }

  renderEntriesList() {
    return (
      <Grid padded>
        {this.state.entries.map((entry, pos) => {
          return (
            <Grid.Row key={entry.entryId}>
              <Grid.Column width={3} verticalAlign="middle">
              {entry.attachmentUrl && (
                <Image className="entryImage" src={entry.attachmentUrl} circular />
              )}
              </Grid.Column>
              <Grid.Column width={8} verticalAlign="top">
              <Label 
                color='blue' 
                ribbon
                >
                  <Button
                  basic
                  compact
                  size='mini'
                  inverted={true}
                  onClick={() =>this.onEntryDetails(entry.entryId)}>
                  {entry.headline}
                  </Button>
                  
                </Label>
              
                <p className="entryDescription">
                {entry.description}
                </p>
                
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                <p>{shortDate(entry.entryDate)}</p>
                <Rating
                  icon='heart'
                  maxRating={5}
                  disabled
                  rating={entry.mood}
                  />
                  
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(entry.entryId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onEntryDelete(entry.entryId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              
              <Grid.Column width={16}>
                <Divider />
               
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
