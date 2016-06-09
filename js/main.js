// declaration of pokemon card component class
class PokemonCard {
	constructor(name, sprite) {
		this.name = name;
		this.sprite = sprite;
	}

	get card() {
		return this.buildCardHtml();
	}

	buildCardHtml() {
		var card =
		'<div class="pokemon-card">\n\
			<img src=' + this.sprite + '>\n\
			<p class="pokemon-name">' + this.name + '</p>\n\
			<div class="type-container">\n\
			</div>\n\
		</div>';
		return card;
	}

	render() {
		$('.pokemon-display-container').html(this.card);
	}

	addClickFunction() {
		$('.pokemon-card').click(function() {
			$('.pokemon-card').toggle('hidden');
			$('.evoution').toggle('hidden');
		})
	}
}

var errorCard =
		'<div class="pokemon-card">\n\
			<img src="./img/missingno.png">\n\
			<p class="pokemon-name">Missingno</p>\n\
			<div class="type-container">\n\
			</div>\n\
		</div>';
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
		var pokemonCardOne = new PokemonCard(data.name, data.sprites.front_default);
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
			console.error('the getPokemonSpeciesEndpoint API call failed.');
		});
	}

// call evolution chain endpoint
function getEvolutionChain(pokemonEvolutionApi) {
	var globalResponse;
	$.getJSON(pokemonEvolutionApi)
	.done(function(data) {
		// establish storage array of species URLs and evolution link
		var evolutionUrlArray = [data.chain.species.url];
		var evolutionLink = data.chain.evolves_to;

		// call recursive evolution link
		var pokemonEvolutionFamily = evolutionChainLink(evolutionLink, evolutionUrlArray);
		var evolutionIds = getPokemonIds(pokemonEvolutionFamily);

		replaceWithEvolution(evolutionIds);
	})
	.fail(function() {
		$('.pokemon-display-container').html(errorCard);
		console.error('the getEvolutionChain API call failed.');
	});
}

function replaceWithEvolution(arrayOfEvolutionIds) {
	var evolutionFamilyContents = "";

	for (var i = 0; i < arrayOfEvolutionIds.length; i++) {
		var pokemonEndpoint = 'http://pokeapi.co/api/v2/pokemon/' + arrayOfEvolutionIds[i];
		var inputId = getInputId();

		if (arrayOfEvolutionIds[i] !== inputId) {
			$.getJSON(pokemonEndpoint)
			.done(function(data) {
		 	 	$('.pokemon-display-container').append(
		 	 	'<div class="pokemon-card evolution hidden">\n\
					<img src=' + data.sprites.front_default + '>\n\
					<p class="pokemon-name">' + data.name + '</p>\n\
					<div class="type-container">\n\
					</div>\n\
				</div>'
		 	 	);
			})
			.fail(function() {
		  		$('.pokemon-display-container').html(errorCard);
				console.error('the replaceWithEvolution function failed.');
		  	});
		}
	}
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
