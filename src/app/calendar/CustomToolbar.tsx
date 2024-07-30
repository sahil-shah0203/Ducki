import React from 'react';
import {ToolbarProps, Navigate, View, Views, NavigateAction} from 'react-big-calendar';

const CustomToolbar: React.FC<ToolbarProps> = ({ label, onNavigate, onView }) => {
  const handleNavigate = (action: NavigateAction) => {
    onNavigate(action);
  };

  const handleView = (view: View) => {
    onView(view);
  };

  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => handleNavigate(Navigate.TODAY)}>Today</button>
        <button type="button" onClick={() => handleNavigate(Navigate.PREVIOUS)}>Back</button>
        <button type="button" onClick={() => handleNavigate(Navigate.NEXT)}>Next</button>
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
        <button type="button" onClick={() => handleView(Views.MONTH)}>Month</button>
        <button type="button" onClick={() => handleView(Views.WEEK)}>Week</button>
        <button type="button" onClick={() => handleView(Views.DAY)}>Day</button>
      </span>
    </div>
  );
};

export default CustomToolbar;
