const fs = require('fs');
let file = fs.readFileSync('src/pages/Stock/ProductsList.tsx', 'utf8');

file = file.replace(
  '<button onClick={() => onEdit(p.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 transition-colors">',
  `<button title="Ficha Técnica" onClick={() => setSelectedProductForRecipe(p)} className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 mr-4 transition-colors">
                      <ClipboardList size={18} />
                    </button>
                    <button title="Editar" onClick={() => onEdit(p.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 transition-colors">`
);

file = file.replace(
  '    </div>\n  );\n}',
  `      {selectedProductForRecipe && (
        <RecipeModal
          product={selectedProductForRecipe}
          onClose={() => {
            setSelectedProductForRecipe(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}`
);

fs.writeFileSync('src/pages/Stock/ProductsList.tsx', file);
