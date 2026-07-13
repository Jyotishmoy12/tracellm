ALTER TABLE export_destinations
  ADD COLUMN export_config text NOT NULL DEFAULT '{"exportSpans":true,"exportEvents":true,"exportErrors":true,"exportTokenUsage":true,"exportMetadata":true,"exportContent":false,"spanKinds":["llm","tool","retrieval","agent","workflow","custom"]}';
