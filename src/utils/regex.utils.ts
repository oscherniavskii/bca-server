export const getRegex = (term: string): RegExp => {
	const sanitizedSearchTerm = term.replace(/[.*+?^${}()|[/]\\]/g, '\\$&');

	const regex = new RegExp(sanitizedSearchTerm, 'i');

	return regex;
};
