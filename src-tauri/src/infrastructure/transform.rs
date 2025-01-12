use serde::Serializer;

pub fn empty_to_null<S>(value: &Option<String>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    match value {
        Some(s) if s.is_empty() => serializer.serialize_none(),
        Some(s) => serializer.serialize_some(s),
        None => serializer.serialize_none(),
    }
}
