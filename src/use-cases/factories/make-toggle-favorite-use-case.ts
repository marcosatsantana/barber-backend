import { PrismaFavoritesRepository } from '../../repositorys/prisma/prisma-favorites-repository'
import { ToggleFavoriteUseCase } from '../toggle-favorite'

export function makeToggleFavoriteUseCase() {
  const repository = new PrismaFavoritesRepository()
  return new ToggleFavoriteUseCase(repository)
}