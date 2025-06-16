import { Card } from "primereact/card";

export const DealTotalsProfit = () => {
    return (
        <Card className='profit-card totals-profit'>
            <div className='profit-card__header totals-profit__header'>Totals</div>
            <div className='profit-card__body totals-profit__body'>
                <div className='totals-content'>
                    <div className='totals-row totals-vehicle-profit'>
                        <span>Vehicle Profit:</span>
                        <span>$0.00</span>
                    </div>
                    <div className='totals-row totals-fni-profit'>
                        <span>(+) F&amp;I Profit:</span>
                        <span>$0.00</span>
                    </div>
                    <div className='totals-row totals-fni-profit-blue'>
                        <span>(+) F&amp;I Profit:</span>
                        <span>$0.00</span>
                    </div>
                    <div className='totals-row'>
                        <span>(-) Misc. Cost:</span>
                        <input type='text' value='$0.00' />
                    </div>
                    <div className='totals-row'>
                        <span>(-) Misc. Cost:</span>
                        <input type='text' value='$0.00' />
                    </div>
                    <div className='totals-row'>
                        <span>(+) Reserve Refund from Finance Co.:</span>
                        <span>$0.00</span>
                    </div>
                    <div className='totals-row'>
                        <span>(+) Vehicle Pack:</span>
                        <span>$0.00</span>
                    </div>
                    <div className='totals-row'>
                        <span>(+) Doc Fee:</span>
                        <span>$0.00</span>
                    </div>
                    <div className='totals-row totals-total-profit'>
                        <span>(=) Total Profit:</span>
                        <span>$0.00</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
