import React from 'react'

const InstrumentInfoModal = (props) => {
    const { modalInfo, id } = props
    return <div id={id} className="modal">
        <div className="modal-content no-margin">
            <div className="row">
                <div className="col s12">
                    <h3>Info</h3>
                </div>
            </div>
            <div className="row">
                <div className="col s6">
                    <div className="row">
                        {" "}
                        <b className="col s3">Name</b>
                        <div className="col s9">{modalInfo.name}</div>
                    </div>
                    <div className="row">
                        {" "}
                        <b className="col s3">Trading Symbol</b>
                        <div className="col s9">
                            {modalInfo.tradingsymbol}
                        </div>
                    </div>
                    <div className="row">
                        {" "}
                        <b className="col s3">Instrument Type</b>
                        <div className="col s9">
                            {modalInfo.instrument_type}
                        </div>
                    </div>
                    <div className="row">
                        {" "}
                        <b className="col s3">Lot Size</b>
                        <div className="col s9">{modalInfo.lot_size}</div>
                    </div>
                    <div className="row">
                        {" "}
                        <b className="col s3">Expiry</b>
                        <div className="col s9">{modalInfo.expiry}</div>
                    </div>
                    <div className="row">
                        {" "}
                        <b className="col s3">Exchange</b>
                        <div className="col s9">{modalInfo.exchange}</div>
                    </div>
                </div>
                <div className="col s6">
                    <div className="row">
                        {" "}
                        <b className="col s3">Instrument Token</b>
                        <div className="col s9">
                            {modalInfo.instrument_token}
                        </div>
                    </div>
                    <div className="row">
                        {" "}
                        <b className="col s3">Exchange Token</b>
                        <div className="col s9">
                            {modalInfo.exchange_token}
                        </div>
                    </div>
                    <div className="row">
                        {" "}
                        <b className="col s3">Segment</b>
                        <div className="col s9">{modalInfo.segment}</div>
                    </div>
                    <div className="row">
                        {" "}
                        <b className="col s3">Strike</b>
                        <div className="col s9">{modalInfo.strike}</div>
                    </div>
                    <div className="row">
                        {" "}
                        <b className="col s3">Tick Size</b>
                        <div className="col s9">{modalInfo.tick_size}</div>
                    </div>
                    {/* <div> <b className="col s6">Last Price</b><div className="col s6">{modalInfo.last_price}</div></div> */}
                </div>
            </div>
        </div>
        <div className="modal-footer">
            <button className="modal-close waves-effect waves-green btn-flat">
                Close
      </button>
        </div>
    </div>
}

export default InstrumentInfoModal