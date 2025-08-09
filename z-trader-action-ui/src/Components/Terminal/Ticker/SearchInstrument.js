import React, { Component } from 'react'
import Select, { components } from 'react-select';
import './search-instrument.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import * as dbHelper from '../../../helpers/api/db';

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

    handleInstrumentSearch = async (value) => {
        let query = escapeRegexCharacters(value)
        let filterValue = this.state.filterValue.value
        if (query.length > 1) {
            const instrumentOptions = dbHelper.queryInstrument(query, filterValue);
            this.setState({ instrumentOptions })
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
                this.setState({ instrumentValue: '' })
            }
        }
    }

    render() {
        const { instrumentValue, instrumentOptions, filterValue } = this.state;
        // let { nightMode } = this.props
        const filterOptions = this.filterOptions
    
        return (
            <div>
                <div className="row row-no-margin" style={{ height: '40px' }}>
                    <div className="col s9 left input-field no-padding no-margin search-container">
                        <Select
                            value={instrumentValue}
                            onChange={(value) => this.handleInstrumentSelect(value)}
                            onInputChange={(query) => this.handleInstrumentSearch(query)}
                            styles={customStyles}
                            options={instrumentOptions}
                            placeholder={<div><FontAwesomeIcon icon={faSearch} /> &nbsp; Search Instruments</div>}
                            components={{
                                Option: CustomOption,
                                NoOptionsMessage,
                                Menu
                            }}
                            className="fontAwesome" />
                    </div>
                    <div className="col right s3 input-field no-margin no-padding search-container">
                        <Select
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
