import { PrismaFavoritesRepository } from '../../repositorys/prisma/prisma-favorites-repository'
import { ListFavoritesUseCase } from '../list-favorites'

export function makeCheckFavoriteUseCase() {
  const repository = new PrismaFavoritesRepository()
  return new ListFavoritesUseCase(repository)
}