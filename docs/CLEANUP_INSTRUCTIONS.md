# Final Cleanup Instructions

After successfully reorganizing the project structure, you should perform these final cleanup steps:

## 1. Remove Duplicate Files

The following files are now duplicated and should be removed from the root directory:

```bash
# Remove these files (they've been relocated to src/db/...)
rm CORRECAO_DADOS_CARREIRA.md
rm SUPABASE_SETUP_INSTRUCTIONS.md
rm supabase-career-functions.sql
rm supabase-exec-sql.sql
rm supabase-fix-all-career-issues.sql
rm supabase-fix-profiles.sql
rm supabase-schema-update.sql
rm supabase-schema.sql
```

## 2. Update Import Paths

If you encounter any import path issues after organizing the files, you may need to update import statements in your code.

## 3. Git Management

If you're using Git, make sure to:

```bash
# Add the new files
git add src/db/

# Commit the changes
git commit -m "refactor: reorganize project structure with better documentation"
```

## 4. Verify Documentation Links

Ensure all documentation links in README.md and other files correctly point to the new file locations.

## 5. Remove This File

Once cleanup is complete, you can remove this guide:

```bash
rm CLEANUP_INSTRUCTIONS.md
```