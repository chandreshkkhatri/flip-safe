import React, { Component } from 'react'

class AppContent extends Component {
    render() {
        let { textColor, appBackgroundColor, children } = this.props
        return (
            <div className={`row no-margin app-content ${textColor} ${appBackgroundColor}`}>
                <div className="col s12 no-padding">
                    {children}
                </div>
            </div>
        )
    }
}

export default AppContent