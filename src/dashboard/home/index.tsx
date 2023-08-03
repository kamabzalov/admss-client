import "./index.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { useState } from "react";

export default function Home() {
  const [date, setDate] = useState(null);
  return <>
    <div className="card bottom-space">
      <div className="card-header">
        <h2 className="card-header__title uppercase m-0">Common tasks</h2>
      </div>
    </div>

    <div className="card bottom-space">
      <div className="card-header">
        <h2 className="card-header__title uppercase m-0">Tasks</h2>
      </div>
      <div className="card-content">
        <div className="flex justify-content-between">
          <div>
            <ul className="list-none ml-0 pl-0">
              <li className="mb-2">
                <Checkbox name="category" value="Add new arrivals to inventory" checked={false} />
                <label className="ml-2">Add new arrivals to
                  inventory</label>
              </li>
              <li className="mb-2">
                <Checkbox name="category" value="Complete all daily tasks" checked={false} />
                <label className="ml-2">Complete all daily tasks</label>
              </li>
              <li className="mb-2">
                <Checkbox name="category" value="Create new tasks" checked={false} />
                <label className="ml-2">Create new tasks</label>
              </li>
            </ul>
          </div>
          <div>
            <Calendar value={date} inline showWeek />
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-content-between">
      <div style={{flexBasis: '686px'}} className="card right-space">
        <div className="card-header">
          <h2 className="card-header__title uppercase m-0">Recent messages</h2>
        </div>
        <div className="card-content">
          <DataTable>
            <Column field="from" header="From"></Column>
            <Column field="theme" header="Theme"></Column>
            <Column field="date" header="Date"></Column>
          </DataTable>
        </div>
      </div>
      <div style={{flexBasis: '455px'}} className="card right-space">
        <div className="card-header">
          <h2 className="card-header__title uppercase m-0">Recently added contact</h2>
        </div>
        <div className="card-content">
          <dl>
            <dt>Beast of Bodmin</dt>
            <dd>A large feline inhabiting Bodmin Moor.</dd>
          </dl>
          <dl>
            <dt>Beast of Bodmin</dt>
            <dd>A large feline inhabiting Bodmin Moor.</dd>
          </dl>
          <dl>
            <dt>Beast of Bodmin</dt>
            <dd>A large feline inhabiting Bodmin Moor.</dd>
          </dl>
        </div>
      </div>
      <div style={{flexBasis: '338px'}} className="card">
        <div className="card-header">
          <h2 className="card-header__title uppercase m-0">Printing</h2>
        </div>
      </div>
    </div>
  </>;
}
