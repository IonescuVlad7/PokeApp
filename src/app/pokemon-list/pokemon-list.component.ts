import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTabGroup } from '@angular/material/tabs';

interface Pokemon {
  name: string;
  height: number;
  types: { type: { name: string } }[];
  elementType?: string; // Optional property to store the element type
  url: string; // Add the 'url' property
  image: string;
}



@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css']
})
export class PokemonListComponent implements OnInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  pokemons: any[] = [];
  filteredPokemons: Pokemon[] | null = null;
  filteredSecondTabPokemons: Pokemon[] | null = null;
  selectedPokemon: any;
  searchTerm: string = '';
  selectedTabIndex: number = 0;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchPokemons();
  }

  fetchPokemons(): void {
    this.http.get<any>('https://pokeapi.co/api/v2/pokemon?limit=10&offset=0')
      .subscribe(response => {
        this.pokemons = response.results.map((pokemon: any, index: number) => {
          return { ...pokemon, url: pokemon.url, image: `assets/pokemon-images/pokemon${index + 1}.jpg` };
        });
        this.splitPokemons();
      });
  }
  
  

  splitPokemons(): void {
    const totalPokemons = this.pokemons.length;
    const half = Math.ceil(totalPokemons / 2);
    this.filteredPokemons = this.pokemons.slice(0, half);
    this.filteredSecondTabPokemons = this.pokemons.slice(half);
  }

  displayPokemon(pokemon: Pokemon): void {
    this.selectedPokemon = pokemon;
    const pokemonId = this.getPokemonIdFromUrl(pokemon.url);
    const imagePath = `assets/pokemon-images/pokemon${pokemonId}.jpg`;
    this.setBackgroundImage(imagePath);
    this.fetchPokemonDetails(pokemon.url);
  }
  
  getPokemonIdFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 2];
  }
  
  setBackgroundImage(imagePath: string): void {
  const container = document.querySelector('.container') as HTMLElement;
  if (container) {
    container.style.backgroundImage = `url(${imagePath})`;
  }
}
  
  
  fetchPokemonDetails(url: string): void {
    this.http.get<any>(url)
      .subscribe(response => {
        this.selectedPokemon.height = response.height;
        this.selectedPokemon.types = response.types;
        const pokemonId = response.id;
        this.selectedPokemon.image = `assets/pokemon-images/pokemon${pokemonId}.jpg`;
      });
  }

  fetchElementData(url: string): void {
    this.http.get<any>(url)
      .subscribe(response => {
        const elementType = response.genera.find((genus: any) => genus.language.name === 'en').genus;
        this.selectedPokemon.elementType = elementType;
      });
  }

  navigateTab(direction: number): void {
    const currentIndex = this.selectedTabIndex;
    const maxIndex = this.tabGroup._tabs.length - 1;
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex <= maxIndex) {
      this.selectedTabIndex = newIndex;
    }
  }

  filterPokemons(): void {
    const filtered = this.pokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  
    const totalPokemons = filtered.length;
    const half = Math.ceil(totalPokemons / 2);
  
    this.filteredPokemons = filtered.slice(0, half);
    this.filteredSecondTabPokemons = filtered.slice(half);
  
    // Automatically switch to the appropriate tab based on the search results
    if (this.filteredSecondTabPokemons && this.selectedTabIndex === 0 && this.filteredSecondTabPokemons.length > 0) {
      this.selectedTabIndex = 1;
    } else if (this.filteredPokemons && this.selectedTabIndex === 1 && this.filteredPokemons.length > 0) {
      this.selectedTabIndex = 0;
    }
  }
  
}
