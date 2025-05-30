import db from "."

const hairStyles = [
    {
      id: 1,
      name: 'Kiểu tóc 1',
      image: 'https://png.pngtree.com/png-clipart/20230508/ourmid/pngtree-men-black-hair-png-image_7085441.png',
    },
    {
      id: 2,
      name: 'Kiểu tóc 2',
      image: 'https://static.vecteezy.com/system/resources/thumbnails/051/688/544/small_2x/modern-stylish-men-curly-hair-wig-fashionable-hairstyle-isolate-on-transparency-background-png.png',
    },
    {
      id: 3,
      name: 'Kiểu tóc 3',
      image: 'https://static.vecteezy.com/system/resources/thumbnails/051/689/279/small_2x/modern-stylish-men-wavy-hair-wig-fashionable-hairstyle-isolate-on-transparency-background-png.png',
    },
    {
      id: 4,
      name: 'Kiểu tóc 4',
      image: 'https://static.vecteezy.com/system/resources/previews/045/911/025/non_2x/a-close-up-of-a-woman-s-hair-with-a-black-wig-stock-png.png',
    },
  ]

  await db.hairStyle.deleteMany()
  await db.hairStyle.createMany({
    data: hairStyles.map((hair) => ({
        name: hair.name,
        imageUrl: hair.image,
    })),
  })
