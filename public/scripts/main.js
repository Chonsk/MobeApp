(function () {
  'use strict';

  var LayeredComponentMixin = {
    componentDidMount: function() {
      this._layer = document.getElementById('popup_node');
      this._renderLayer();
    },

    componentDidUpdate: function() {
      this._renderLayer();
    },

    componentWillUnmount: function() {
      this._unrenderLayer();
      var popupNode = document.getElementById('popup_node');
      popupNode.removeChild(this._layer);
    },

    _renderLayer: function() {
      var layerElement = this.renderLayer();

      if (layerElement === null) {
        React.render(<noscript />, this._layer);
      } else {
        React.render(layerElement, this._layer);
      }

      if (this.layerDidMount) {
        this.layerDidMount(this._layer);
      }
    },

    _unrenderLayer: function() {
      if (this.layerWillUnmount) {
        this.layerWillUnmount(this._layer);
      }
      React.unmountComponentAtNode(this._layer);
    }
  };

  var App = React.createClass({
    mixins: [LayeredComponentMixin],
    handleClick: function() {
      var that = this;
      document.getElementById('popup_node').className = 'hidden';
      // use a timeout to ensure animation is done before removing the node
      setTimeout(function() {
        that.setState({shown: !that.state.shown});
      }, 200);
    },
    getInitialState: function() {
      return {shown: false, activePlayer: 0};
    },
    renderLayer: function() {
      if (!this.state.shown) {
        return <span />;
      } else {
      }
      return (
        <Popup url={'api/player/'+this.state.activePlayer} onRequestClose={this.handleClick}></Popup>
      );
    },
    _onPlayerClicked: function(id) {
      document.getElementById('popup_node').className = 'visible';
      this.setState({shown: !this.state.shown, activePlayer: id});
    },
    render: function() {
      var that = this;
      return (
        <div>
          <div className="playerlist_title" >Player ranking</div>
          <PlayersList url="api/players" onPlayerClicked={that._onPlayerClicked}/>
          <div id="popup_node" className="hidden" ></div>
        </div>
      );
    }
  });

  var PlayersList = React.createClass({
    loadPlayersFromServer: function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
    getInitialState: function() {
      return {data: []};
    },
    componentDidMount: function() {
      this.loadPlayersFromServer();
    },
    _onPlayerClicked: function(id) {
      this.props.onPlayerClicked(id);
    },
    render: function() {
      var that = this;
      var playerItems = this.state.data.map(function(player, index) {
        return (
          <PlayerItem name={player.name} 
                      rank={player.ranking}
                      position={player.positionText}
                      team={player.teamName}
                      id={player.id}
                      key={player.id}
                      onPlayerClicked={that._onPlayerClicked}>
          </PlayerItem>
        );
      });
      return (
        <div>
          {playerItems}
        </div>
      );
    }
  });

  var PlayerItem = React.createClass({
    handleClick: function() {
      this.props.onPlayerClicked(this.props.id);
    },
    render: function() {
      return (
        <div className="playerlist_item" onClick={this.handleClick}>

          <div className="playerlist_item_rank">
            {this.props.rank}
          </div>

          <div className="playerlist_item_right_container">
            <div className="playerlist_item_name">
              {this.props.name}
            </div>
            <div className="playerlist_item_subinfo">
              {this.props.position + ', ' + this.props.team}
            </div>
          </div>
        </div>
      );
    }
  });


  // Popup component
  var Popup = React.createClass({
    loadPlayerFromServer: function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },
    getInitialState: function() {
      return {data: []};
    },
    componentDidMount: function() {
      this.loadPlayerFromServer();
    },
    killClick: function(e) {
      // clicks on the content shouldn't close the popup
      e.stopPropagation();
    },
    handleBackdropClick: function() {
      // when you click the background, the user is requesting that the popup gets closed.
      // note that the popup has no say over whether it actually gets closed. the owner of the
      // popup owns the state. this just "asks" to be closed.
      this.props.onRequestClose();
    },
    render: function() {

      var passPercentage = (1 * this.state.data.passSuccess).toFixed(2); //round

      return (
        <div className="popup_backdrop" onClick={this.handleBackdropClick}>
          <div className="popup_content" onClick={this.killClick}>
            <div className="player_header" >

              <div className="playerlist_item_right_container">
                <div className="playerlist_item_name">
                  {this.state.data.name}
                </div>
                <div className="playerlist_item_subinfo">
                  {this.state.data.teamName}
                </div>
              </div>
            </div>
            <div>
              <div className="player_info_header" >Player info</div>
              <InfoLine infoString="Age" infoValue={this.state.data.age}></InfoLine>
              <InfoLine infoString="Weight" infoValue={this.state.data.weight}></InfoLine>
              <InfoLine infoString="Height" infoValue={this.state.data.height}></InfoLine>
            </div>
            <div>
              <div className="player_info_header" >{'Statistics season ' + this.state.data.seasonName}</div>
              <InfoLine infoString="Goals" infoValue={this.state.data.goal}></InfoLine>
              <InfoLine infoString="Assists" infoValue={this.state.data.assistTotal}></InfoLine>
              <div className="player_info" >
                <div className="info_title">Cards</div>
                <div className="info_value">
                  <div className="card yellow">{this.state.data.yellowCard}</div>
                  <div className="card red">{this.state.data.redCard}</div>
                </div>
              </div>
              <InfoLine infoString="Position" infoValue={this.state.data.positionText}></InfoLine>
              <InfoLine infoString="Played positions" infoValue={this.state.data.playedPositions}></InfoLine>
              <InfoLine infoString="Appearances" infoValue={this.state.data.apps}></InfoLine>
              <InfoLine infoString="Appearances as sub" infoValue={this.state.data.subOn}></InfoLine>
              <InfoLine infoString="Pass percentage" infoValue={passPercentage}></InfoLine>
              <InfoLine infoString="Minutes played" infoValue={this.state.data.minsPlayed}></InfoLine>
              
            </div>
          </div>
        </div>
      );
    }
  });
  
  var InfoLine = React.createClass({
    render: function() {
      return (
        <div className="player_info" >
          <div className="info_title">{this.props.infoString}</div>
          <div className="info_value">{this.props.infoValue}</div>
        </div>
      );
    }
  });


  React.render(<App />, document.body);

}());

/**
player data object  { 
  passSuccess: '83.51528384',
  ranking: '2',
  seasonId: '4336',
  seasonName: '2014/2015',
  tournamentId: '3',
  tournamentRegionId: '81',
  tournamentRegionCode: 'de',
  regionCode: 'nl',
  tournamentName: 'Bundesliga',
  tournamentShortName: 'GB',
  firstName: 'Arjen',
  lastName: 'Robben',
  playerId: '4173',
  isActive: 'TRUE',
  isOpta: 'TRUE',
  teamId: '37',
  teamName: 'Bayern Munich',
  playedPositions: '-FW-ML-MR-',
  age: '31',
  height: '180',
  weight: '80',
  positionText: 'Midfielder',
  apps: '18',
  subOn: '1',
  minsPlayed: '1475',
  rating: '8.56',
  goal: '16',
  assistTotal: '5',
  yellowCard: '0',
  redCard: '0',
  shotsPerGame: '4.388888889',
  aerialWonPerGame: '0.9444444444',
  manOfTheMatch: '9',
  name: 'Arjen Robben',
  isManOfTheMatch: 'FALSE',
  playedPositionsShort: 'M(LR),FW' }
*/
