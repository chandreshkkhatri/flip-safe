import React, { Component } from 'react';

import Select from 'react-select';
let customStyles = {
    input: () => ({ height: '34px' }),
}
class SelectFilter extends Component {
    render() {
        let { options, placeholder } = this.props
        if (options.length === 0) {
            console.log(options)
        }
        return (
            <div>
                <Select
                    defaultValue=''
                    styles={customStyles}
                    options={options}
                    placeholder={placeholder}
                    className="fontAwesome"
                />
            </div>
        );
    }
}

export default SelectFilter