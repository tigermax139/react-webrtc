import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

import './styles/index.less';
import 'webrtc-adapter';

window.onerror = err => alert(`${err.message}`);
window.onunhandledrejection = err => alert(`${err.message}`);

ReactDOM.render(<App />, document.getElementById('root'));
