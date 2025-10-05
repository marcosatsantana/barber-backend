import { FavoritesRepository } from '../repositorys/prisma/prisma-favorites-repository'

interface ToggleFavoriteRequest {
  userId: string
  barbershopId: string
}

interface ToggleFavoriteResponse {
  isFavorite: boolean
}

export class ToggleFavoriteUseCase {
  constructor(private favoritesRepository: FavoritesRepository) {}

  async execute({ userId, barbershopId }: ToggleFavoriteRequest): Promise<ToggleFavoriteResponse> {
    const isCurrentlyFavorite = await this.favoritesRepository.isFavorite(userId, barbershopId)
    
    if (isCurrentlyFavorite) {
      await this.favoritesRepository.removeFavorite(userId, barbershopId)
      return { isFavorite: false }
    } else {
      await this.favoritesRepository.addFavorite(userId, barbershopId)
      return { isFavorite: true }
    }
  }
}