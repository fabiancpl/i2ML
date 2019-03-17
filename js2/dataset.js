var dataset = ( function() {

  var name,
    datasetURL, configURL,
    data, visibleData,
    config, embeddingFeatures;

  function init() {

    d3.select( '#load-dataset-input' )
      .on( 'change', _ => {

        // Get the file name
        var dataFile = d3.event.target.files[ 0 ];
        if ( !dataFile ) return;

        // Extract the name of the dataset
        name = dataFile.name.split( '.' )[ 0 ];

        d3.select( '#dataset-name' ).html( dataFile.name );

        // Get the path of the file and call the function for load it
        var reader = new FileReader();
        reader.onloadend = function( evt ) {
          datasetURL = evt.target.result;
        };
        reader.readAsDataURL( dataFile );

      } );

    d3.select( '#load-config-input' )
      .on( 'change', _ => {

        // Get the file name
        var configFile = d3.event.target.files[ 0 ];
        if ( !configFile ) return;

        d3.select( '#config-name' ).html( configFile.name );

        // Get the path of the file and call the function for load it
        var reader = new FileReader();
        reader.onloadend = function( evt ) {
          configURL = evt.target.result;
        };
        reader.readAsDataURL( configFile );

        loadConfig();

      } );

  }

  function loadDataset( n ) {

    if( n ) {
      name = n;
      datasetURL = './data/' + name + '.csv';

    }

    return d3.csv( datasetURL, d3.autoType ).then( d => {

      console.log( 'Dataset loaded sucessfully!' );

      data = d;
      visibleData = data;
      config = createConfig();

    } ).catch( error => console.log( 'Error loading the dataset!' ) );

  }

  function createConfig() {

    config = {};

    // Creating feature descriptions
    keys = Object.keys( data[ 0 ] );
    config.features = keys.map( f => {
      var type = identifyDataType( f );
      return {
        name: f,
        type: type,
        role: ( type === 'sequential' || type ===  'binary' ) ? 'embed' : ( f === 'class' ) ? 'color' : 'none'
      }
    } );

    // Creating models hyper-parameters
    config.models = {
      'embed': {
        'iterations': 1000,
        'perplexity': 25,
        'epsilon': 200,
        'runned': false
      }, 
      'cluster': {
        'clusters': 3,
        'embedded_space': false,
        'runned': false
      }

    };

    console.log( 'By default configuration created!' );

    return config;

  }

  function identifyDataType( f ) {
    if( typeof data[ 0 ][ f ] === 'number' ) { 
      
      var values = d3.map( data, d => d[ f ] ).keys();
      if( values.length === 2 && ( values.includes( "0" ) && values.includes( "1" ) ) ) {
        return 'binary';
      } else {
        return 'sequential';
      }
    } else {
      return 'categorical';
    } 
  }

  // Load the configuration file
  function loadConfig() {

    // Load the the configuration file
    d3.json( configURL ).then( c => {

      console.log( 'Configuration loaded!' );
      config = c;

      // TODO: Uppdate with new config
      //updateWithConfig();

    } ).catch( error => console.log( 'Error loading the configuration file!' ) );

  }

  return {
    init: init,
    loadDataset: loadDataset,
    loadConfig: loadConfig,
    get name() {
      return name;
    },
    get data() {
      return data;
    },
    get visibleData() {
      return visibleData;
    },
    get config() {
      return config;
    },
    set config( c ) {
      config = c;
    }
  }
} )();