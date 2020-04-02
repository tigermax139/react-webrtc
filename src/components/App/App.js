import React from 'react';

import Layout from '../Layout';
import Rtc from '../RTC';

import {ThemeContext, themes} from '../../theme-context';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: themes.dark,
    }
  }

  render() {
    return (
      <div className="app-container">
        {/* eslint-disable-next-line react/destructuring-assignment */}
        <ThemeContext.Provider value={this.state.theme}>
          <Layout>
            <Rtc/>
          </Layout>
        </ThemeContext.Provider>
      </div>
    );
  }
}

export default App;
