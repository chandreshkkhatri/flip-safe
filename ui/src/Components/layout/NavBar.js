import React, { Component } from 'react'

class NavBar extends Component {
    render() {
        let { navColor, navTextColor } = this.props

        return <div className="row no-margin navbar-fixed navbar-container ">
            <nav className={`${navColor}`}>
                <div className={`nav-wrapper`}>
                    <div className={`col s11`}>
                        <div className={`col ${navTextColor} brand-logo`}><i className="material-icons">widgets</i>Z-Trader</div>
                        <div className={`col right`}>
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    }
}

export default NavBar