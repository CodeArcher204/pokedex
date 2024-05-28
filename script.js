allPokemon = [];
let nextUrl;

const typeColorMap = {
    fire: "#fa9292",
    water: "#76BFFE",
    grass: "#47D1B1",
    brown: "#918469",
    bug: "#90BA2E",
    poison: "#A819D7",
    ground: "#B69130",
    fairy: "#CC72CD",
    psychic: "#CD3C70",
    fighting: "#792E1C",
    rock: "#A18732",
    ghost: "#404096",
    ice: "#309FBE",
    dragon: "#5537CA",
    flying: "#075865",
    electric: "#FFFA24",
    steel: "#080A0F",
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function setBackgroundColor(pokemonCard, types) {
    const primaryType = types[0].toLowerCase();
    const color = typeColorMap[primaryType] || "#ABA974";
    pokemonCard.style.backgroundColor = color;
}

function getPokemonTypes(pokemon) {
    let typesArray = pokemon["types"];
    let typeNames = [];
    for (let i = 0; i < typesArray.length; i++) {
        let typeName = typesArray[i].type.name;
        typeNames.push(typeName);
    }
    return typeNames;
}

function getPokemonInfo(pokemon) {
    let name = capitalizeFirstLetter(pokemon["name"]);
    let imgSource = pokemon["sprites"]["other"]["official-artwork"]["front_default"];
    let height = pokemon["height"];
    let weight = pokemon["weight"];
    let abilities = pokemon["abilities"].map((a) => a.ability.name).join(", ");
    let stats = pokemon["stats"];
    let hp = stats[0].base_stat;
    let attack = stats[1].base_stat;
    let defense = stats[2].base_stat;
    let specialAttack = stats[3].base_stat;
    let specialDefense = stats[4].base_stat;
    let speed = stats[5].base_stat;
    let total = hp + attack + defense + specialAttack + specialDefense + speed;
    let types = getPokemonTypes(pokemon);
    return { name, types, imgSource, height, weight, abilities, hp, attack, defense, specialAttack, specialDefense, speed, total };
}

function createPokemonCard(pokemonDetails, type) {
    let UppercaseName = capitalizeFirstLetter(pokemonDetails.name);
    const pokemonCard = document.createElement("div");
    pokemonCard.className = "pokemon-card";
    setBackgroundColor(pokemonCard, type);
    pokemonCard.innerHTML = `
        <img src="${pokemonDetails.sprites.front_default}" alt="${pokemonDetails.name}" />
        <span>${UppercaseName}</span>
    `;
    pokemonCard.addEventListener("click", () => {
        showPokemonDetails(pokemonDetails.id);
    });
    return pokemonCard;
}

async function loadPokemonList() {
    let url = nextUrl || "https://pokeapi.co/api/v2/pokemon?limit=20";
    let response = await fetch(url);
    let pokemonList = await response.json();
    nextUrl = pokemonList.next;
    renderPokemonList(pokemonList.results);
}

async function loadPokemonDetails(pokemonId) {
    let url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

async function showPokemonDetails(pokemonId) {
    const pokemonDetails = await loadPokemonDetails(pokemonId);
    const pokemonInfo = getPokemonInfo(pokemonDetails);
    renderPokemonInfo(pokemonInfo);
}

async function renderPokemonList(pokemonList) {
    const listContainer = document.getElementById("pokemonList");
    const loadingIndicator = document.getElementById("loadingIndicator");
    const loadingText = document.getElementById("loadingText");

    let loadedCount = 0;
    const totalCount = pokemonList.length;

    loadingIndicator.style.display = 'flex';
    loadingText.textContent = `${loadedCount} von ${totalCount} Pokémon geladen`;

    for (const pokemon of pokemonList) {
        const pokemonDetails = await loadPokemonDetails(pokemon.name);
        allPokemon.push(pokemonDetails);
        const type = getPokemonTypes(pokemonDetails);
        const pokemonCard = createPokemonCard(pokemonDetails, type);
        listContainer.appendChild(pokemonCard);

        loadedCount++;
        loadingText.textContent = `${loadedCount} of ${totalCount} Pokémon loaded.`;
    }

    loadingIndicator.style.display = 'none';
}


function renderPokemonInfo(pokemonInfo) {
    document.getElementById("info-container").innerHTML = `
        <div class="pokeInfoIMG" id="pokemonImgContainer">
            <img class="detailPokeImg" id="pokemonImage" src="${pokemonInfo.imgSource}" alt="Pokemon Image" />
        </div>
        <h1>${pokemonInfo.name}</h1>
        <div id="pokeTypes" class="pokemonTypes"></div>
        <div class="detailedInfoCard">
                <div class="about-section">
                <h2>About</h2>
                <p>Height: ${pokemonInfo.height / 10} m</p>
                <p>Weight: ${pokemonInfo.weight / 10} kg</p>
                <p>Abilities: ${pokemonInfo.abilities}</p>
            </div>
            <div class="base-stats-section">
                <h2>Base Stats</h2>
                <p>HP: ${pokemonInfo.hp}</p>
                <p>Attack: ${pokemonInfo.attack}</p>
                <p>Defense: ${pokemonInfo.defense}</p>
                <p>Special Attack: ${pokemonInfo.specialAttack}</p>
                <p>Special Defense: ${pokemonInfo.specialDefense}</p>
                <p>Speed: ${pokemonInfo.speed}</p>
                <p><b>Total: ${pokemonInfo.total}</b></p>
            </div>

        </div>
        `;
    const pokemonImageContainer = document.getElementById("pokemonImgContainer");
    setBackgroundColor(pokemonImageContainer, pokemonInfo.types);
    const pokeTypesContainer = document.getElementById("pokeTypes");
    renderPokemonTypes(pokeTypesContainer, pokemonInfo.types);
    document.getElementById("pokemonOverlay").classList.remove("hidden");
}

function renderPokemonTypes(typesContainer, types) {
    types.forEach((typeName) => {
        let typeColor = typeColorMap[typeName.toLowerCase()] || "#ABA974";
        let typeSpan = document.createElement("span");
        typeSpan.className = "pokemon-type";
        typeSpan.textContent = typeName;
        typeSpan.style.backgroundColor = typeColor;
        typesContainer.appendChild(typeSpan);
    });
}

function closeOverlay() {
    document.getElementById("pokemonOverlay").classList.add("hidden");
}

document.getElementById("pokemonOverlay").addEventListener("click", function (event) {
    if (event.target === document.getElementById("pokemonOverlay")) {
        closeOverlay();
    }
});

document.getElementById("closeOverlay").addEventListener("click", closeOverlay);

document.getElementById("searchInput").addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        searchPokemon();
    }
});

document.getElementById("searchInput").addEventListener("input", function () {
    let searchText = this.value.toLowerCase();
    let filteredList = allPokemon.filter((pokemon) => pokemon.name.toLowerCase().includes(searchText));
    renderSearchedPokemon(filteredList);
    if (!searchText) {
        document.querySelector(".showMoreButton").style.display = "flex";
    }
});

async function loadMorePokemon() {
    if (nextUrl) {
        await loadPokemonList();
    } else {
        alert("no more Pokemon to load");
    }
}

function renderSearchedPokemon(pokemonList) {
    let listContainer = document.getElementById("pokemonList");
    document.querySelector(".showMoreButton").style.display = "none";
    listContainer.innerHTML = "";
    for (let pokemon of pokemonList) {
        let type = getPokemonTypes(pokemon);
        let pokemonCard = createPokemonCard(pokemon, type);
        listContainer.appendChild(pokemonCard);
    }
}
