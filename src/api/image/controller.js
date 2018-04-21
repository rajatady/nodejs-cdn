import {removeAllImages, removeImages, uploadImagesToDO, getAllImages} from '../../services/digitalocean'

export const create = ({body, data}, res, next) => {
  console.log(data)
  uploadImagesToDO(data)
    .then(result => {
      return removeImages(data)
    })
    .then(result => {
      res.status(200).json(data)
    })
    .catch(err => {
      console.log(err.stack)
      res.status(500).json({error: err.message || 'Some error occurred', data: data})
    })
}

export const index = ({querymen: {query, select, cursor}}, res, next) =>
  getAllImages(query)
    .then(result => res.status(200).json({data: result}))
    .catch(err => res.status(500).json({error: err.stack || 'Some error occurred'}))

export const show = ({params}, res, next) =>
  res.status(200).json({})

export const update = ({body, params}, res, next) =>
  res.status(200).json(body)

export const destroy = ({params}, res, next) =>
  res.status(204).end()

export const destroyAll = ({params}, res, next) =>
  removeAllImages()
    .then(result => res.status(204).json({data: result}))
    .catch(err => res.status(500).json({error: err.stack || 'Some error occurred'}))
