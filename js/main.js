// declaration of pokemon card component class
class PokemonCard {
	constructor(name, sprite, isInitialPokemon) {
		this.name = name;
		this.sprite = sprite;
		this.isInitialPokemon = isInitialPokemon;
	}

	get html() {
		return this.buildCardHtml();
	}

	buildCardHtml() {
		var pokemonCardClassList = 'pokemon-card';
		if (!this.isInitialPokemon) {
			pokemonCardClassList += ' evolution hidden';
		}

		var card =
		'<div class="' + pokemonCardClassList + '">\n\
			<img src=' + this.sprite + '>\n\
			<p class="pokemon-name">' + this.name + '</p>\n\
		</div>'
		return card;
	}

	render() {
		$('.pokemon-display-container').html(this.html);
	}

	addClickFunction() {
		$('.pokemon-card').click(function() {
			$('.evolution').toggle('hidden');
			console.log('click listener on!');
		})
	}
}

var errorCard =
		'<div class="pokemon-card">\n\
			<img src="./img/missingno.png">\n\
			<p class="pokemon-name">Missingno</p>\n\
		</div>';

// var pokemonCardList = [];

// function renderPokemonCardList() {

// }


////////////////////////////////////// ASYNCHRONOUS API CALL FUNCTIONS ////////////////////////////////////////
// KICKOFF API CALL — runs inputID for intial card and kicks off evolution details
function getPokemonApiData(pokemonId) {
	getPokemonEndpoint(pokemonId);
	getPokemonSpeciesEndpoint(pokemonId);
}

// call pokemon endpoint, get name and sprite, render to page, addclickfunction
function getPokemonEndpoint(pokemonId) {
	var pokemonEndpoint = 'http://pokeapi.co/api/v2/pokemon/' + pokemonId;

	$.getJSON(pokemonEndpoint)
	.done(function(data) {
		var pokemonCardOne = new PokemonCard(data.name, data.sprites.front_default, true);
 	 	pokemonCardOne.render();
 	 	pokemonCardOne.addClickFunction();
	})
	.fail(function() {
		$('.pokemon-display-container').html(errorCard);
  	})
}

// call pokemon species endpoint, do more stuff
function getPokemonSpeciesEndpoint(pokemonId) {
	var pokemonSpeciesEndpoint = 'http://pokeapi.co/api/v2/pokemon-species/' + pokemonId;

	// call pokemon species endpoint
		$.getJSON(pokemonSpeciesEndpoint)
		.done(function(data) {
			var pokemonEvolutionApi = data.evolution_chain.url;
			getEvolutionChain(pokemonEvolutionApi);
		})
		.fail(function() {
			$('.pokemon-display-container').html(errorCard);
		});
	}

// call evolution chain endpoint
function getEvolutionChain(pokemonEvolutionApi) {
	var globalResponse;
	$.getJSON(pokemonEvolutionApi)
	.done(function(data) {
		// establish storage array of species URLs and evolution link
		// var evolutionUrlArray = [data.chain.species.url];
		var evolutionRootNode = data.chain;

		// call recursive evolution link
		var pokemonEvolutionFamily = getAllEvolutions(evolutionRootNode);
		var evolutionIds = getPokemonIds(pokemonEvolutionFamily);

		replaceWithEvolution(evolutionIds);
	})
	.fail(function() {
		$('.pokemon-display-container').html(errorCard);
		console.error('the getEvolutionChain API call failed.');
	});
}

function replaceWithEvolution(arrayOfEvolutionIds) {
	var evolutionChainPromises = [];
	var inputId = getInputId();

	for (var i = 0; i < arrayOfEvolutionIds.length; i++) {
		var pokemonEndpoint = 'http://pokeapi.co/api/v2/pokemon/' + arrayOfEvolutionIds[i];
		if (arrayOfEvolutionIds[i] != inputId) {
			evolutionChainPromises[i] = $.getJSON(pokemonEndpoint);
		} else {
			evolutionChainPromises[i] = $.Deferred().resolve();
		}
	}

	$.when.apply($, evolutionChainPromises)
		.done(function() {
			var args = Array.prototype.slice.call(arguments);
			for (var i = 0; i < args.length; i++) {
				if (args[i]) {
					var data = args[i][0];
					var pokemonCard = new PokemonCard(data.name, data.sprites.front_default, false);
					$('.pokemon-display-container').append(pokemonCard.html);
				}
			}
			console.log('ready to evolve');
		});
}

////////////////////////////////////// HELPER FUNCTIONS ////////////////////////////////////////
function getInputId() {
	var inputId = $('.pokemon-input-feild').val();
	return inputId;
}
// takes two arguments: array from the evoution chain and the storage array (which already contians the first species)
//if that array has something inside of it
// first push the species url into the collection array
// then call itself with the next evolution link
function evolutionChainLink(evolutionChainArray, storageArray) {
	if (evolutionChainArray.length > 0) {
		// loop through evolutionchain contents
		storageArray.push(evolutionChainArray[0].species.url);
		return evolutionChainLink(evolutionChainArray[0].evolves_to, storageArray);
	}
	return storageArray;
}

function getAllEvolutions(node) {
	//establish array to be reutyred
	var storageArray = [];
	storageArray.push(node.species.url);

	var evolutionNodes = node.evolves_to;

	//loop through evolition array and call funciton recursively
	for (var i = 0; i < evolutionNodes.length; i++) {
		storageArray = storageArray.concat(getAllEvolutions(evolutionNodes[i]));
	}

	return storageArray;
}


function getPokemonIds(urlArray) {
	// return urlArray.map(function splitAtSlash() {
	var intArray = [];
	// });
	for (var i = 0; i < urlArray.length; i++) {
		urlArray[i] = urlArray[i].split('/');
	}
	for (var j = 0; j < urlArray.length; j++) {
		intArray.push(parseInt(urlArray[j][urlArray[j].length - 2]));
	}
	return intArray;
}

////////////////////////////////////// USER ACTIONS ////////////////////////////////////////
// user clicks go button; call pokemon api and render pokemon card with user input
$('.input-btn').click(function() {
	var inputId = getInputId();
	getPokemonApiData(inputId);
});
