import React, { Component } from 'react'
import axios from 'axios'
import Select, { components } from 'react-select';
import './search-instrument.css'

let customStyles = {
    input: () => ({ height: '34px' }),
}

const escapeRegexCharacters = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
class CustomOption extends Component {
    render() {
        let props = this.props
        return <components.Option {...props} />
    }
}

const Menu = (props) => <components.Menu {...props} />

const NoOptionsMessage = (props) => <components.NoOptionsMessage {...props} />

class SearchInstrument extends Component {

    constructor() {
        super();
        this.state = {
            instrumentValue: '',
            instrumentOptions: [],
            filterValue: { label: 'EQ', value: 'EQ' }
        };
    }
    filterOptions = [
        { label: 'EQ', value: 'EQ' },
        { label: 'NFO', value: 'NFO' },
        { label: 'MCX', value: 'MCX' },
        { label: 'CDS', value: 'CDS' },
        { label: 'None', value: '' },
    ]
    fetchedInstruments

    handleInstrumentSearch = (value) => {
        let query = escapeRegexCharacters(value)
        let filterValue = this.state.filterValue.value
        if (query.length > 1) {
            axios.get(`http://localhost:3000/db/query-instruments?queryString=${query}&filterString=${filterValue}`)
                .then((res) => {
                    this.fetchedInstruments = res.data
                    let data = res.data
                    let instrumentOptions = []
                    for (let it in data) {
                        instrumentOptions.push({
                            label: `${data[it]['tradingsymbol']} ${data[it]['segment']}`,
                            exchange: data[it]['exchange'],
                            key: data[it]['_id']
                        })
                    }
                    this.setState({ instrumentOptions })
                })
                .catch((err) => console.log(err))
        }
        else {
            this.setState({ instrumentOptions: [] })
        }
    }
    handleInstrumentSelect = (value) => {
        let item = value
        for (let it in this.fetchedInstruments) {
            if (this.fetchedInstruments[it]['_id'] === item.key) {
                this.props.onInstrumentSelect(this.fetchedInstruments[it])
                // this.setState({ instrumentValue: '' })
            }
        }
    }
    render() {
        const { instrumentValue, instrumentOptions, filterValue } = this.state;
        const filterOptions = this.filterOptions
        let tabIndex = ['1', '2']
        if (this.props.tabIndex) {
            tabIndex = this.props.tabIndex
        }
        return (
            <div>
                <div className="row row-no-margin">
                    {/* style={{ height: '40px' }} */}
                    <div className="col s9 left no-padding no-margin">
                        <Select
                            tabIndex={tabIndex[0]}
                            value={instrumentValue}
                            onChange={(value) => this.handleInstrumentSelect(value)}
                            onInputChange={(query) => this.handleInstrumentSearch(query)}
                            styles={customStyles}
                            options={instrumentOptions}
                            placeholder="&#xf002; &nbsp; Search Instruments"
                            components={{
                                Option: CustomOption,
                                NoOptionsMessage,
                                Menu
                            }}
                            className="fontAwesome" />
                    </div>
                    <div className="col right s3 no-margin no-padding search-container">
                        <Select
                            tabIndex={tabIndex[1]}
                            value={filterValue}
                            onChange={(value) => this.setState({ filterValue: value })}
                            styles={customStyles}
                            options={filterOptions}
                            placeholder="&#xf0b0;"
                            className="fontAwesome" />
                    </div>
                </div>
            </div>
        );
    }
}

export default SearchInstrument
